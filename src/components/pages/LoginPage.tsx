import React, { useEffect } from 'react';
import { PageId, Language, BrandVariant } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from '../auth/LoginForm';
import { Loader2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  brand: BrandVariant;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { profile, loading, hasActiveSubscription } = useAuth();
  
  // URL params logic if we were using a router. 
  // In our SPA, we can pass props or use state, but we'll keep it simple:
  // If user is already logged in, redirect to dashboard.
  useEffect(() => {
    if (loading || !profile) return;
    
    if (hasActiveSubscription) {
      onNavigate('dashboard');
    } else {
      onNavigate('pricing' as PageId);
    }
  }, [profile, loading, hasActiveSubscription, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="py-12 animate-fade-in flex items-center justify-center">
      <LoginForm 
        onSuccess={() => onNavigate('dashboard')} 
        onGoRegister={() => alert("Implémentation de l'inscription à faire. Connectez-vous avec un compte existant.")}
      />
    </div>
  );
};
