import React from 'react';
import { Clock, AlertTriangle, CreditCard } from 'lucide-react';
import { PageId } from '../../types';

export function TrialBanner({ onNavigate, trialEndsAt, subscriptionStatus, planExpiresAt }: any) {
  if (subscriptionStatus === 'active') {
    if (planExpiresAt && (planExpiresAt - Date.now()) <= 7 * 24 * 60 * 60 * 1000) {
      return (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-3 text-amber-300">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">
              Votre abonnement expire bientôt. Renouvelez-le pour éviter toute interruption de service.
            </p>
            <button 
              onClick={() => onNavigate('pricing' as PageId)} 
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-md text-xs font-bold transition-colors"
            >
              Renouveler
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  if (subscriptionStatus === 'expired' || subscriptionStatus === 'cancelled') {
    return (
      <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 border-b border-red-500/30 px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-3 text-red-300">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">
            Votre abonnement ou période d'essai est expiré. Vos accès sont restreints.
          </p>
          <button 
            onClick={() => onNavigate('pricing' as PageId)} 
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-md text-xs font-bold transition-colors"
          >
            S'abonner
          </button>
        </div>
      </div>
    );
  }

  if (subscriptionStatus === 'trial' && trialEndsAt) {
    const daysLeft = Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24));
    return (
      <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border-b border-violet-500/30 px-4 py-3 text-center backdrop-blur-md relative z-50">
        <div className="flex items-center justify-center gap-3 text-violet-200">
          <Clock className="w-5 h-5" />
          <p className="text-sm font-medium">
            {daysLeft > 0 
              ? `Il vous reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''} d'essai gratuit.`
              : 'Votre essai gratuit expire aujourd\'hui !'
            }
          </p>
          <button 
            onClick={() => onNavigate('pricing' as PageId)} 
            className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-violet-500/25 transition-all"
          >
            Choisir un plan
          </button>
        </div>
      </div>
    );
  }

  return null;
}
