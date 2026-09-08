import React from 'react';
import { Lock } from 'lucide-react';
import { usePlanGate, FeatureKey } from '../hooks/usePlanGate';

interface PlanGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  onNavigate?: (page: string) => void;
}

/**
 * Dispatche un event custom pour naviguer vers pricing sans dépendre de react-router-dom.
 * App.tsx peut écouter cet event via window.addEventListener('bizos:navigate', ...).
 */
function navigateToPricing(onNavigate?: (page: string) => void) {
  if (onNavigate) {
    onNavigate('pricing');
    return;
  }
  // Fallback: custom event capté par App.tsx
  window.dispatchEvent(new CustomEvent('bizos:navigate', { detail: { page: 'pricing' } }));
}

export const PlanGate: React.FC<PlanGateProps> = ({ feature, children, onNavigate }) => {
  const { canAccess, plan } = usePlanGate();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  const requiredPlanText = plan === 'FREE' ? 'PRO' : 'ENTERPRISE';

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Contenu flouté */}
      <div className="absolute inset-0 pointer-events-none blur-sm opacity-50 select-none overflow-hidden">
        {children}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/40 z-10 p-6 text-center">
        <div className="bg-[#140826] rounded-2xl p-8 max-w-md shadow-xl flex flex-col items-center border border-[#d946ef]/30">
          <div className="w-16 h-16 bg-[#d946ef]/20 text-[#f472b6] rounded-full flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">
            Fonctionnalité verrouillée
          </h3>

          <p className="text-slate-300 mb-8 text-sm leading-relaxed">
            Cette section est disponible avec le plan{' '}
            <span className="font-semibold text-[#f472b6]">{requiredPlanText}</span>.
            Mettez à niveau votre abonnement pour y accéder.
          </p>

          <button
            onClick={() => navigateToPricing(onNavigate)}
            className="w-full bg-gradient-to-r from-[#d946ef] to-[#f472b6] hover:from-[#c026d3] hover:to-[#ec4899] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#d946ef]/25 hover:shadow-[#d946ef]/40"
          >
            Mettre à niveau maintenant
          </button>
        </div>
      </div>
    </div>
  );
};
