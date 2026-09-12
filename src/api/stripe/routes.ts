import { Hono } from 'hono';
import { requireAuthHono } from '../auth/middleware';
import { createCheckoutSession, createPortalSession } from './checkout';
import { handleStripeWebhook } from './webhook';

// Hono Stripe Router
const stripeRouter = new Hono<{ Variables: { prisma: any, session: any } }>();

// ======= POST /api/billing/checkout =======
stripeRouter.post('/checkout', requireAuthHono, async (c) => {
  return createCheckoutSession(c);
});

// ======= POST /api/billing/portal =======
stripeRouter.post('/portal', requireAuthHono, async (c) => {
  return createPortalSession(c);
});

// ======= POST /api/billing/webhook =======
// Stripe webhook expects RAW body for signature verification.
stripeRouter.post('/webhook', async (c) => {
  return handleStripeWebhook(c);
});

// ======= GET /api/billing/status =======
stripeRouter.get('/status', requireAuthHono, async (c) => {
  try {
    const prisma = c.get('prisma');
    const session = c.get('session');
    const orgId = session.organizationId;
    
    if (!orgId || orgId === 'unassigned') {
      return c.json({ error: 'Organization non assignée' }, 400);
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return c.json({ error: 'Organisation introuvable' }, 404);
    }

    // Adaptation des champs selon schema.prisma actuel
    // Note: 'subscriptionStatus' n'est pas dans le schéma Prisma natif par défaut pour Organization,
    // mais si des champs manquent, il faut s'assurer qu'ils existent ou les extraire de la db.
    return c.json({
      subscriptionStatus: (org as any).subscriptionStatus,
      plan:               (org as any).plan,
      planExpiresAt:      (org as any).planExpiresAt,
      trialEndsAt:        (org as any).trialEndsAt,
      seatsIncluded:      (org as any).seatsIncluded,
      seatsUsed:          (org as any).seatsUsed,
      stripeCustomerId:   (org as any).stripeCustomerId,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default stripeRouter;
