/**
 * POST /api/billing/checkout
 * Crée une Stripe Checkout Session pour un plan donné.
 * 
 * Body: { planId: 'pro', billing: 'monthly' }
 * Headers: Authorization: Bearer <jwt_token>
 * 
 * Retourne: { url: 'https://checkout.stripe.com/...' }
 */
import type { Request, Response } from 'express';
import { stripe, STRIPE_PRICE_IDS } from './stripeClient';
import { adminDb } from '../../firebase/firebaseAdmin';

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const { planId, billing = 'monthly' } = req.body;
    
    // Récupère l'utilisateur authentifié depuis le middleware JWT
    const uid = (req as any).uid as string;
    const orgId = (req as any).orgId as string;

    if (!uid || !orgId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Validation du plan
    const priceKey = `${planId}_${billing}`;
    const priceId = STRIPE_PRICE_IDS[priceKey];
    if (!priceId) {
      return res.status(400).json({ error: `Plan invalide: ${priceKey}` });
    }

    // Récupère ou crée le Stripe Customer pour cette organisation
    const orgRef = adminDb.collection('organizations').doc(orgId);
    const orgSnap = await orgRef.get();
    const orgData = orgSnap.data() || {};

    let customerId: string = orgData.stripeCustomerId;

    if (!customerId) {
      // Récupère l'email de l'utilisateur pour créer le client Stripe
      const userSnap = await adminDb.collection('users').doc(uid).get();
      const userData = userSnap.data() || {};

      const customer = await stripe.customers.create({
        email: userData.email || '',
        name: orgData.name || '',
        metadata: {
          orgId,
          createdBy: uid,
        },
      });
      customerId = customer.id;

      // Sauvegarde l'ID Stripe dans Firestore
      await orgRef.update({ stripeCustomerId: customerId });
    }

    // Crée la Checkout Session Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.VITE_APP_URL || 'http://localhost:5173'}/pricing?cancelled=true`,
      metadata: {
        orgId,
        uid,
        planId,
        billing,
      },
      subscription_data: {
        metadata: { orgId, planId, billing },
        trial_period_days: 0, // Trial déjà géré côté app
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('[Stripe Checkout]', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur Stripe' });
  }
}

/**
 * POST /api/billing/portal
 * Crée une session Stripe Customer Portal pour gérer l'abonnement (annulation, mise à jour CB, etc.)
 */
export async function createPortalSession(req: Request, res: Response) {
  try {
    const uid = (req as any).uid as string;
    const orgId = (req as any).orgId as string;

    if (!uid || !orgId) return res.status(401).json({ error: 'Non authentifié' });

    const orgSnap = await adminDb.collection('organizations').doc(orgId).get();
    const customerId = orgSnap.data()?.stripeCustomerId;

    if (!customerId) {
      return res.status(404).json({ error: 'Aucun abonnement Stripe trouvé pour cette organisation' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/settings`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('[Stripe Portal]', error);
    return res.status(500).json({ error: error.message });
  }
}
