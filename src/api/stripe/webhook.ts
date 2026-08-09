/**
 * POST /api/billing/webhook
 * Reçoit et vérifie les événements Stripe, puis synchronise Firestore.
 * 
 * CRITIQUE : Ce endpoint doit recevoir le body RAW (Buffer) pour que la
 * vérification de signature Stripe fonctionne. Ne pas passer par express.json().
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from './stripeClient';
import { syncSubscriptionToFirestore } from './subscriptionSync';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET manquant');
    return res.status(500).json({ error: 'Webhook secret non configuré' });
  }

  let event: Stripe.Event;

  try {
    // Vérifie la signature cryptographique — protège contre les faux webhooks
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('[Webhook] Signature invalide:', err.message);
    return res.status(400).json({ error: `Webhook invalide: ${err.message}` });
  }

  console.log(`[Webhook] Événement reçu: ${event.type} — ${event.id}`);

  try {
    switch (event.type) {

      // ✅ Paiement initial réussi (checkout terminé)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscriptionToFirestore(sub, 'active', session.metadata);
        }
        break;
      }

      // ✅ Renouvellement mensuel/annuel réussi
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          const sub = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
          await syncSubscriptionToFirestore(sub, 'active');
        }
        break;
      }

      // ❌ Échec de paiement (carte refusée, expirée…)
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          const sub = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
          await syncSubscriptionToFirestore(sub, 'past_due');
        }
        break;
      }

      // 🔄 Mise à jour de l'abonnement (upgrade, downgrade, changement de CB)
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due'  ? 'past_due'
          : sub.status === 'trialing'  ? 'trial'
          : 'suspended';
        await syncSubscriptionToFirestore(sub, status as any);
        break;
      }

      // 🗑️ Annulation (fin de période ou immédiate)
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionToFirestore(sub, 'cancelled');
        break;
      }

      default:
        // Événements non gérés — on ignore silencieusement
        console.log(`[Webhook] Événement ignoré: ${event.type}`);
    }
  } catch (err: any) {
    console.error('[Webhook] Erreur traitement:', err);
    return res.status(500).json({ error: 'Erreur traitement webhook' });
  }

  // Stripe exige un 200 rapide pour confirmer la réception
  return res.status(200).json({ received: true });
}
