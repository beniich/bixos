/**
 * Stripe Client — initialisation singleton
 * Charge la clé secrète depuis les variables d'environnement.
 * NE JAMAIS exposer cette instance côté frontend (Vite).
 */
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('[Stripe] STRIPE_SECRET_KEY manquant dans les variables d\'environnement');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-07-29.dahlia' as any,
});

// Mapping Plan ID → Stripe Price ID (à remplir avec vos vraies Price IDs)
export const STRIPE_PRICE_IDS: Record<string, string> = {
  starter_monthly:    process.env.STRIPE_PRICE_STARTER_MONTHLY   || 'price_STARTER_MONTHLY',
  starter_yearly:     process.env.STRIPE_PRICE_STARTER_YEARLY    || 'price_STARTER_YEARLY',
  pro_monthly:        process.env.STRIPE_PRICE_PRO_MONTHLY       || 'price_PRO_MONTHLY',
  pro_yearly:         process.env.STRIPE_PRICE_PRO_YEARLY        || 'price_PRO_YEARLY',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_ENTERPRISE_MONTHLY',
  enterprise_yearly:  process.env.STRIPE_PRICE_ENTERPRISE_YEARLY  || 'price_ENTERPRISE_YEARLY',
};

// Durée de chaque plan (en secondes, pour planExpiresAt)
export const PLAN_DURATION_SECONDS: Record<string, number> = {
  monthly: 30 * 24 * 60 * 60,
  yearly:  365 * 24 * 60 * 60,
};
