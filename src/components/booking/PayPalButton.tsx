import React, { useEffect, useRef, useState } from 'react';
import { loadPayPalSdk, PAYPAL_CONFIG } from '../../config/paypal';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface PayPalButtonProps {
  bookingId: string;
  totalAmount: number;
  currency?: string;
  onSuccess: (bookingId: string, details?: any) => void;
  onError?: (err: any) => void;
  onCancel?: () => void;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  bookingId,
  totalAmount,
  currency = PAYPAL_CONFIG.currency,
  onSuccess,
  onError,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initPayPal() {
      try {
        setLoading(true);
        setError(null);

        const paypal = await loadPayPalSdk(PAYPAL_CONFIG.clientId, currency);
        if (!isMounted || !paypal || !containerRef.current) return;

        // Clear container before rendering
        containerRef.current.innerHTML = '';

        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 44,
          },
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: `Réservation BizOS #${bookingId}`,
                  custom_id: bookingId,
                  amount: {
                    currency_code: currency,
                    value: totalAmount.toFixed(2),
                  },
                },
              ],
            });
          },
          onApprove: async (_data: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              if (isMounted) {
                onSuccess(bookingId, details);
              }
            } catch (err: any) {
              if (isMounted) {
                const msg = err?.message || 'Erreur lors de la capture du paiement PayPal';
                setError(msg);
                if (onError) onError(err);
              }
            }
          },
          onError: (err: any) => {
            if (isMounted) {
              const msg = err?.message || 'Une erreur est survenue avec PayPal';
              setError(msg);
              if (onError) onError(err);
            }
          },
          onCancel: () => {
            if (onCancel) onCancel();
          },
        }).render(containerRef.current);

        setLoading(false);
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Impossible de charger le module PayPal');
          setLoading(false);
          if (onError) onError(err);
        }
      }
    }

    initPayPal();

    return () => {
      isMounted = false;
    };
  }, [bookingId, totalAmount, currency, onSuccess, onError, onCancel]);

  return (
    <div className="w-full space-y-3">
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-xl border border-white/10 text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
          <p className="text-xs text-slate-300 font-medium">Chargement sécurisé de PayPal...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-red-200">{error}</div>
        </div>
      )}

      <div ref={containerRef} className={loading ? 'hidden' : 'block'} />

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Paiement protégé par la Protection des Achats PayPal</span>
      </div>
    </div>
  );
};
