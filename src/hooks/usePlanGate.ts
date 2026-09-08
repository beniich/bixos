import { useAuth } from '../context/AuthContext';

export type FeatureKey =
  | 'overview'
  | 'energy'
  | 'water'
  | 'eam'
  | 'cmms'
  | 'predictive'
  | 'spaces'
  | 'inventory'
  | 'esg'
  | 'carbon_credits'
  | 'air_quality'
  | 'copilot'
  | 'digital_twin'
  | 'leases'
  | 'saas_offers'
  | 'settings'
  | 'cyber'
  | 'beecarbonat';

// Matrix of plan access
// FREE has limited access
// PRO has full access to almost everything except some ENTERPRISE features
// ENTERPRISE has full access
const FEATURE_PLAN_MATRIX: Record<FeatureKey, { FREE: boolean; PRO: boolean; ENTERPRISE: boolean }> = {
  overview: { FREE: true, PRO: true, ENTERPRISE: true },
  energy: { FREE: false, PRO: true, ENTERPRISE: true }, // FREE is preview only, handled separately if needed or just false for full access
  water: { FREE: false, PRO: true, ENTERPRISE: true },
  eam: { FREE: true, PRO: true, ENTERPRISE: true }, // FREE: 5 assets (handled by business logic)
  cmms: { FREE: true, PRO: true, ENTERPRISE: true }, // FREE: 3 OT (handled by business logic)
  predictive: { FREE: false, PRO: true, ENTERPRISE: true },
  spaces: { FREE: false, PRO: true, ENTERPRISE: true },
  inventory: { FREE: false, PRO: true, ENTERPRISE: true },
  esg: { FREE: false, PRO: true, ENTERPRISE: true }, // FREE is preview only
  carbon_credits: { FREE: false, PRO: true, ENTERPRISE: true },
  air_quality: { FREE: false, PRO: true, ENTERPRISE: true },
  copilot: { FREE: false, PRO: true, ENTERPRISE: true },
  digital_twin: { FREE: false, PRO: false, ENTERPRISE: true },
  leases: { FREE: false, PRO: true, ENTERPRISE: true },
  saas_offers: { FREE: true, PRO: true, ENTERPRISE: true },
  settings: { FREE: true, PRO: true, ENTERPRISE: true },
  cyber: { FREE: false, PRO: false, ENTERPRISE: true },
  beecarbonat: { FREE: false, PRO: false, ENTERPRISE: true },
};

export function usePlanGate() {
  const { isFreePlan, isProPlan, isEnterprisePlan, user } = useAuth();

  const currentPlan = isEnterprisePlan ? 'ENTERPRISE' : isProPlan ? 'PRO' : 'FREE';

  const canAccess = (feature: FeatureKey): boolean => {
    // Admin always has access to everything
    if (user?.role === 'SUPER_ADMIN') {
      return true;
    }
    return FEATURE_PLAN_MATRIX[feature]?.[currentPlan] ?? false;
  };

  return {
    plan: currentPlan,
    isFree: isFreePlan,
    isPro: isProPlan,
    isEnterprise: isEnterprisePlan,
    canAccess,
  };
}
