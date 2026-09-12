import Stripe from 'stripe';
import { PLAN_DURATION_SECONDS } from './stripeClient';

export type SubscriptionSyncStatus =
  | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'suspended';

function resolvePlanFromSubscription(sub: Stripe.Subscription): { planId: string; billing: string } {
  if (sub.metadata?.planId && sub.metadata?.billing) {
    return { planId: sub.metadata.planId, billing: sub.metadata.billing };
  }
  const priceId = sub.items.data[0]?.price?.id || '';
  if (priceId.toLowerCase().includes('enterprise')) return { planId: 'enterprise', billing: 'monthly' };
  if (priceId.toLowerCase().includes('pro'))        return { planId: 'pro',        billing: 'monthly' };
  if (priceId.toLowerCase().includes('starter'))    return { planId: 'starter',    billing: 'monthly' };

  return { planId: 'starter', billing: 'monthly' };
}

function getSeatsForPlan(planId: string): number {
  const seats: Record<string, number> = {
    starter: 5, pro: 25, enterprise: 999,
  };
  return seats[planId] ?? 5;
}

export async function syncSubscriptionToFirestore(
  sub: Stripe.Subscription,
  status: SubscriptionSyncStatus,
  sessionMetadata?: Record<string, string> | null,
  prisma?: any
) {
  const orgId = sub.metadata?.orgId ?? sessionMetadata?.orgId;

  if (!orgId) {
    console.error('[SubscriptionSync] orgId introuvable dans les metadata Stripe');
    return;
  }

  const { planId, billing } = resolvePlanFromSubscription(sub);
  const now = Date.now();
  const durationSec = PLAN_DURATION_SECONDS[billing as keyof typeof PLAN_DURATION_SECONDS] ?? PLAN_DURATION_SECONDS['monthly'];
  const planExpiresAt = new Date(now + durationSec * 1000);

  const orgUpdate: any = {
    subscriptionStatus:  status,
    plan:                planId,
    billing,
    planExpiresAt,
    stripeSubscriptionId: sub.id,
    stripeCustomerId:     sub.customer as string,
    seatsIncluded:        getSeatsForPlan(planId),
  };

  if (status === 'cancelled' || status === 'expired') {
    orgUpdate.subscriptionStatus = 'cancelled';
    orgUpdate.planExpiresAt      = new Date();
    orgUpdate.plan               = 'trial';
  }

  try {
    await prisma.organization.update({
      where: { id: orgId },
      data: orgUpdate,
    });

    // Logging equivalent via prisma.authAuditLog can be added if needed,
    // or you could create a separate model for subscription events.
    await prisma.authAuditLog.create({
      data: {
        eventType: 'SUSPICIOUS_ACTIVITY', // Fallback as there is no specific SUBSCRIPTION event type in the schema yet
        organizationId: orgId,
        metadata: {
          type: `subscription.${status}`,
          planId,
          billing,
          stripeSubId: sub.id,
          status,
          source: 'stripe_webhook',
        },
      }
    });

    console.log(`[SubscriptionSync] ✅ org=${orgId} status=${status} plan=${planId}/${billing}`);

  } catch (err) {
    console.error('[SubscriptionSync] ❌ Erreur Prisma:', err);
    throw err;
  }
}
