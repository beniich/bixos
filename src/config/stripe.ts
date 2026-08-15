import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');
  }
  return stripePromise;
};

export const STRIPE_CONFIG = {
  currency: 'eur',
  paymentMethods: ['card', 'apple_pay', 'google_pay', 'sepa_debit'] as const,
  captureMethod: 'automatic' as const
};
