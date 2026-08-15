// src/services/paymentService.ts
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { getStripe } from '../config/stripe';
import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { confirmBooking, cancelBooking } from './bookingService';
import type { Booking } from '../types/seat';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Crée un PaymentIntent via Cloud Function
 */
export const createPaymentIntent = async (
  bookingId: string
): Promise<PaymentIntent> => {
  const createIntent = httpsCallable(functions, 'createPaymentIntent');
  const result = await createIntent({ bookingId });
  return result.data as PaymentIntent;
}

/**
 * Traite le paiement avec Stripe Elements
 */
export const processPayment = async (
  bookingId: string,
  elements: StripeElements,
  returnUrl: string
): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe non initialisé');
    }

    // 1. Créer le PaymentIntent côté serveur
    const intent = await createPaymentIntent(bookingId);

    // 2. Confirmer le paiement
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret: intent.clientSecret,
      confirmParams: {
        return_url: returnUrl
      },
      redirect: 'if_required'
    });

    if (error) {
      // Annuler la réservation en cas d'échec
      await cancelBooking(bookingId, `Payment failed: ${error.message}`);
      return { success: false, error: error.message };
    }

    if (paymentIntent?.status === 'succeeded') {
      // 3. Confirmer la réservation
      const booking = await confirmBooking(bookingId, paymentIntent.id);
      return { success: true, booking };
    }

    return { success: false, error: 'Paiement en attente' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Lance un remboursement
 */
export const refundPayment = async (
  bookingId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> => {
  try {
    const refundFn = httpsCallable(functions, 'refundPayment');
    const result = await refundFn({ bookingId, amount, reason });
    return { success: true, ...(result.data as any) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Récupère les moyens de paiement sauvegardés
 */
export const getSavedPaymentMethods = async (customerId: string) => {
  const fn = httpsCallable(functions, 'getPaymentMethods');
  const result = await fn({ customerId });
  return result.data;
}

/**
 * Vérifie le statut d'un paiement
 */
export const checkPaymentStatus = async (
  paymentIntentId: string
): Promise<string> => {
  const fn = httpsCallable(functions, 'checkPaymentStatus');
  const result = await fn({ paymentIntentId });
  return (result.data as any).status;
}
