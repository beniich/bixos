import React, { useState } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement 
} from '@stripe/react-stripe-js';
import { processPayment } from '../../services/paymentService';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  bookingId: string;
  totalAmount: number;
  onSuccess: (bookingId: string) => void;
  onCancel: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  bookingId,
  totalAmount,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Call our service to handle the confirmation
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Erreur lors de la validation');
      setIsProcessing(false);
      return;
    }

    const result = await processPayment(
      bookingId,
      elements,
      `${window.location.origin}/booking/success`
    );

    if (!result.success) {
      setError(result.error || 'Le paiement a échoué.');
      setIsProcessing(false);
    } else {
      onSuccess(bookingId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-fuchsia-500/20 rounded-lg">
          <CreditCard className="text-fuchsia-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Paiement Sécurisé</h2>
          <p className="text-gray-400 text-sm">Montant total: {totalAmount.toFixed(2)}€</p>
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-6">
        <PaymentElement 
          options={{
            layout: 'tabs',
            theme: 'night', // Stripe styling match
            variables: {
              colorPrimary: '#d946ef',
              colorBackground: 'transparent',
              colorText: '#ffffff',
              colorDanger: '#ef4444',
              fontFamily: 'Inter, system-ui, sans-serif'
            }
          }}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 py-3 px-4 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-3 px-4 bizos-cta-pink rounded-lg text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Traitement...
            </>
          ) : (
            `Payer ${totalAmount.toFixed(2)}€`
          )}
        </button>
      </div>
    </form>
  );
};
