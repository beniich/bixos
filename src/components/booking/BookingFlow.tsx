import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './CheckoutForm';
import { createPaymentIntent } from '../../services/paymentService';
import { Loader2, ShieldCheck, Ticket } from 'lucide-react';

// loadStripe initialized outside component to avoid recreation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface BookingFlowProps {
  bookingId: string;
  totalAmount: number;
  onSuccess: (bookingId: string) => void;
  onCancel: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  bookingId,
  totalAmount,
  onSuccess,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializePayment = async () => {
      try {
        const intent = await createPaymentIntent(bookingId);
        if (mounted && intent.clientSecret) {
          setClientSecret(intent.clientSecret);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Erreur d\'initialisation du paiement');
        }
      }
    };

    initializePayment();

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  if (error) {
    return (
      <div className="glass-card p-6 rounded-xl border border-red-500/30 bg-red-500/10 text-center">
        <div className="text-red-400 mb-4 flex justify-center">
          <ShieldCheck size={48} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Erreur de Paiement</h3>
        <p className="text-red-200 mb-6">{error}</p>
        <button 
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white transition-colors"
        >
          Retour à la sélection
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="glass-card p-12 rounded-xl flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Sécurisation de votre session</h3>
        <p className="text-gray-400">Préparation de la page de paiement cryptée...</p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#d946ef',
        colorBackground: '#1e0f34',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/30">
          <Ticket className="text-fuchsia-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Finaliser votre commande</h1>
        <p className="text-gray-400">Vos places sont réservées pendant encore quelques minutes.</p>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm 
          bookingId={bookingId} 
          totalAmount={totalAmount} 
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
      
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
        <ShieldCheck size={16} className="text-green-400" />
        <span>Paiement sécurisé et crypté (AES-256)</span>
      </div>
    </div>
  );
};
