import { stripe, STRIPE_PRICE_IDS } from './stripeClient';

export async function createCheckoutSession(c: any) {
  try {
    const prisma = c.get('prisma');
    const sessionCookie = c.get('session');
    const { planId, billing = 'monthly' } = await c.req.json();
    
    const uid = sessionCookie.userId;
    const orgId = sessionCookie.organizationId;

    if (!uid || !orgId || orgId === 'unassigned') {
      return c.json({ error: 'Non authentifié ou organisation manquante' }, 401);
    }

    const priceKey = `${planId}_${billing}`;
    const priceId = STRIPE_PRICE_IDS[priceKey as keyof typeof STRIPE_PRICE_IDS];
    if (!priceId) {
      return c.json({ error: `Plan invalide: ${priceKey}` }, 400);
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return c.json({ error: 'Organisation introuvable' }, 404);
    }

    let customerId = (org as any).stripeCustomerId;

    if (!customerId) {
      const user = await prisma.user.findUnique({ where: { id: uid } });
      const customer = await stripe.customers.create({
        email: user?.email || '',
        name: org.name || '',
        metadata: {
          orgId,
          createdBy: uid,
        },
      });
      customerId = customer.id;
      
      // Update Prisma organization with Stripe customer id
      // Requires adding stripeCustomerId to Prisma schema if missing
      await prisma.organization.update({
        where: { id: orgId },
        data: { stripeCustomerId: customerId } as any,
      });
    }

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
        trial_period_days: 0,
      },
    });

    return c.json({ url: session.url }, 200);

  } catch (error: any) {
    console.error('[Stripe Checkout]', error);
    return c.json({ error: error.message || 'Erreur serveur Stripe' }, 500);
  }
}

export async function createPortalSession(c: any) {
  try {
    const prisma = c.get('prisma');
    const sessionCookie = c.get('session');
    const uid = sessionCookie.userId;
    const orgId = sessionCookie.organizationId;

    if (!uid || !orgId) return c.json({ error: 'Non authentifié' }, 401);

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    const customerId = (org as any)?.stripeCustomerId;

    if (!customerId) {
      return c.json({ error: 'Aucun abonnement Stripe trouvé' }, 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/settings`,
    });

    return c.json({ url: session.url }, 200);

  } catch (error: any) {
    console.error('[Stripe Portal]', error);
    return c.json({ error: error.message }, 500);
  }
}
