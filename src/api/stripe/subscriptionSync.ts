/**
 * Synchronise l'état d'un abonnement Stripe vers Firestore.
 * 
 * Appelé par le webhook handler à chaque événement d'abonnement.
 * Met à jour le document `organizations/{orgId}` avec les données de facturation.
 */
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../firebase/firebaseAdmin';
import { PLAN_DURATION_SECONDS } from './stripeClient';

export type SubscriptionSyncStatus =
  | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'suspended';

/**
 * Extrait le plan BizOS depuis les metadata Stripe.
 * Fallback sur l'analyse du Price ID si metadata absentes.
 */
function resolvePlanFromSubscription(sub: Stripe.Subscription): { planId: string; billing: string } {
  // Priorité 1 : metadata directement sur la subscription
  if (sub.metadata?.planId && sub.metadata?.billing) {
    return { planId: sub.metadata.planId, billing: sub.metadata.billing };
  }

  // Priorité 2 : metadata sur le premier item (price)
  const priceId = sub.items.data[0]?.price?.id || '';
  if (priceId.toLowerCase().includes('enterprise')) return { planId: 'enterprise', billing: 'monthly' };
  if (priceId.toLowerCase().includes('pro'))        return { planId: 'pro',        billing: 'monthly' };
  if (priceId.toLowerCase().includes('starter'))    return { planId: 'starter',    billing: 'monthly' };

  return { planId: 'starter', billing: 'monthly' };
}

/**
 * Résolution du nombre de sièges inclus par plan.
 */
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
) {
  // Récupère l'orgId depuis les metadata (subscription ou session checkout)
  const orgId = sub.metadata?.orgId ?? sessionMetadata?.orgId;

  if (!orgId) {
    console.error('[SubscriptionSync] orgId introuvable dans les metadata Stripe');
    return;
  }

  const { planId, billing } = resolvePlanFromSubscription(sub);
  const now = Date.now();
  const durationSec = PLAN_DURATION_SECONDS[billing] ?? PLAN_DURATION_SECONDS['monthly'];
  const planExpiresAt = now + durationSec * 1000;

  // Données à écrire dans Firestore
  const orgUpdate: Record<string, any> = {
    subscriptionStatus:  status,
    plan:                planId,
    billing,
    planExpiresAt,
    stripeSubscriptionId: sub.id,
    stripeCustomerId:     sub.customer as string,
    seatsIncluded:        getSeatsForPlan(planId),
    updatedAt:            FieldValue.serverTimestamp(),
  };

  // Si annulation, on nettoie la date d'expiration
  if (status === 'cancelled' || status === 'expired') {
    orgUpdate.subscriptionStatus = 'cancelled';
    orgUpdate.planExpiresAt      = now; // Expire immédiatement
    orgUpdate.plan               = 'trial';
  }

  try {
    await adminDb.collection('organizations').doc(orgId).set(orgUpdate, { merge: true });

    // Audit log — traçabilité complète pour compliance
    await adminDb.collection('organizations').doc(orgId)
      .collection('auditLogs').add({
        type:        `subscription.${status}`,
        planId,
        billing,
        stripeSubId: sub.id,
        status,
        timestamp:   FieldValue.serverTimestamp(),
        source:      'stripe_webhook',
      });

    console.log(`[SubscriptionSync] ✅ org=${orgId} status=${status} plan=${planId}/${billing}`);

  } catch (err) {
    console.error('[SubscriptionSync] ❌ Erreur Firestore:', err);
    throw err;
  }
}
