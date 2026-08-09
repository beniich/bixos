import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle, ArrowRight, Receipt } from 'lucide-react';
import { PageId } from '../../types';

interface CheckoutSuccessProps {
  onNavigate: (page: PageId) => void;
}

export function CheckoutSuccess({ onNavigate }: CheckoutSuccessProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Vérifie la session auprès de notre backend (évite de se baser sur l'URL seule)
    const token = localStorage.getItem('biz_access_token');
    fetch(`/api/billing/verify-session?session_id=${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setSessionData(data);
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        // Si le backend n'est pas joignable, on fait confiance à Stripe
        // (la vraie vérification se fait via le webhook de toute façon)
        setStatus('success');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-gray-400">Vérification de votre paiement...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center p-6">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Session de paiement invalide</h1>
        <p className="text-gray-400">Impossible de vérifier votre paiement. Si vous avez été débité, contactez le support.</p>
        <button
          onClick={() => onNavigate('pricing' as PageId)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-semibold transition-all"
        >
          Retour aux abonnements
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-3xl p-10 backdrop-blur-xl">
        
        {/* Animation confetti / success */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          🎉 Bienvenue !
        </h1>
        <p className="text-gray-300 mb-1 text-lg font-semibold">
          Votre abonnement est activé
        </p>
        {sessionData?.plan && (
          <div className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-sm font-bold mb-6">
            Plan {sessionData.plan.toUpperCase()} actif
          </div>
        )}
        {!sessionData?.plan && (
          <div className="inline-block px-4 py-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full text-sm font-bold mb-6">
            Abonnement confirmé
          </div>
        )}

        <p className="text-gray-400 text-sm mb-8">
          Votre espace de travail est maintenant déverrouillé. Accédez à toutes les fonctionnalités BizOS GMAO sans restriction.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/25"
          >
            Accéder au tableau de bord
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('billing' as PageId)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm"
          >
            <Receipt className="w-4 h-4" />
            Voir mes factures
          </button>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-500">
        Un email de confirmation a été envoyé à votre adresse. Conservez-le pour vos archives.
      </p>
    </div>
  );
}
