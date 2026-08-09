import React from 'react';
import { PageId, Language } from '../../types';
import { PricingPlans } from '../pricing/PricingPlans';
import { TrialBanner } from '../pricing/TrialBanner';
import { useAuth } from '../../context/AuthContext';

interface PricingPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();

  return (
    <div className="animate-fade-in relative">
      {/* Banner si l'utilisateur est connecté */}
      {profile && (
        <div className="absolute top-0 left-0 w-full">
          <TrialBanner 
            onNavigate={onNavigate}
            trialEndsAt={profile.trialEndsAt}
            subscriptionStatus={profile.subscriptionStatus}
            planExpiresAt={profile.planExpiresAt}
          />
        </div>
      )}

      {/* Le conteneur principal a un padding-top si une bannière est possible */}
      <div className={`${profile ? 'pt-16' : 'pt-4'}`}>
        <PricingPlans onNavigate={onNavigate} />
      </div>
    </div>
  );
};
