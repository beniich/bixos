import React, { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageId } from '../../types';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Sparkles,
    price: { monthly: 49, yearly: 490 },
    description: 'Pour démarrer',
    features: [
      'Jusqu\'à 5 utilisateurs',
      '2 sites / environnements',
      '50 assets CAFM',
      'Gestion réclamations',
      'Rapports basiques',
      'Support email',
    ],
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    badge: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    price: { monthly: 149, yearly: 1490 },
    description: 'Le plus populaire',
    features: [
      'Jusqu\'à 25 utilisateurs',
      '10 sites / environnements',
      '500 assets CAFM',
      'Diagnostic IA inclus',
      'Workflows avancés',
      'Maintenance préventive',
      'Rapports + analytics',
      'Support prioritaire',
    ],
    color: 'from-violet-500/30 to-fuchsia-500/30 border-violet-500/50',
    badge: 'POPULAIRE',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    price: { monthly: 499, yearly: 4990 },
    description: 'Pour grandes org.',
    features: [
      'Utilisateurs illimités',
      'Sites illimités',
      'Assets illimités',
      'IA avancée + predictive',
      'API + intégrations',
      'Multi-tenant',
      'Audit + compliance',
      'SLA 99.99% + Account Mgr',
    ],
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    badge: 'PREMIUM',
  },
];

export function PricingPlans({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const { profile } = useAuth();
  const currentPlan = profile?.plan || 'trial';

  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    try {
      setIsLoading(planId);
      const token = localStorage.getItem('biz_access_token');
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ planId, billing })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de la session');
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erreur Stripe');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 text-white animate-fade-in">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          Choisissez votre plan
        </h1>
        <p className="text-gray-400 text-lg">
          {profile 
            ? `Bonjour ${profile.displayName}, choisissez un abonnement pour réactiver votre espace`
            : 'Des tarifs transparents pour toutes les tailles d\'entreprise'
          }
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-slate-800/50 border border-slate-700 rounded-lg p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billing === 'monthly' ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
              billing === 'yearly' ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Annuel <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">-17%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-br ${plan.color} border-2 rounded-3xl p-8 backdrop-blur-xl transition-all ${
                plan.badge === 'POPULAIRE' ? 'scale-105 ring-4 ring-violet-500/20' : 'hover:-translate-y-1 hover:shadow-2xl'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-full shadow-lg">
                  {plan.badge}
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 right-5 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                  ACTUEL
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-5xl font-extrabold">{plan.price[billing]}€</span>
                <span className="text-gray-400 ml-1 font-medium">/ {billing === 'monthly' ? 'mois' : 'an'}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1 min-h-[220px]">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent || isLoading !== null}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                  isCurrent
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                    : plan.badge === 'POPULAIRE'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25'
                    : 'bg-white/10 hover:bg-white/20 border border-white/10'
                }`}
              >
                {isLoading === plan.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Chargement...
                  </>
                ) : isCurrent ? (
                  'Plan Actuel'
                ) : (
                  'Choisir ce plan'
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 text-center text-sm text-gray-500">
        <p>En choisissant un plan, vous acceptez nos CGV. Tous nos plans incluent le support prioritaire par email.</p>
        <button onClick={() => onNavigate('dashboard')} className="mt-4 underline hover:text-white">Retour au tableau de bord (Si essai actif)</button>
      </div>
    </div>
  );
}
