import React, { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldX, CreditCard, Mail } from 'lucide-react';
import { PageId } from '../../types';

export type GuardMode = 'public' | 'protected' | 'admin-only' | 'subscription-required';

interface RouteGuardProps {
  children: ReactNode;
  mode?: GuardMode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  onNavigate: (page: PageId) => void;
  activePage: PageId;
}

export function RouteGuard({
  children,
  mode = 'protected',
  allowedRoles,
  requiredPermissions,
  onNavigate,
  activePage
}: RouteGuardProps) {
  const { user, profile, loading, hasActiveSubscription, isAdmin } = useAuth();
  const [guardState, setGuardState] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [denyReason, setDenyReason] = useState<'unauth' | 'no-sub' | 'no-role' | 'no-perm' | 'suspended'>('unauth');

  useEffect(() => {
    if (loading) {
      setGuardState('checking');
      return;
    }

    // Public routes bypass
    if (mode === 'public') {
      setGuardState('allowed');
      return;
    }

    if (!profile) {
      // Pour une SPA avec state `activePage`, si non authentifié et sur route protégée :
      setGuardState('denied');
      setDenyReason('unauth');
      return;
    }

    // Suspended / locked (no isSuspended field in new User type, skip this)

    // Admin Only
    if (mode === 'admin-only') {
      if (!isAdmin) {
        setGuardState('denied');
        setDenyReason('no-role');
        return;
      }
    }

    // Explicit Role Check
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes((profile as any).role)) {
        setGuardState('denied');
        setDenyReason('no-role');
        return;
      }
    }

    // Explicit Permission Check
    if (requiredPermissions && requiredPermissions.length > 0) {
      const permissions: string[] = (profile as any).permissions ?? [];
      const hasAll = requiredPermissions.every(p => permissions.includes(p));
      if (!hasAll) {
        setGuardState('denied');
        setDenyReason('no-perm');
        return;
      }
    }

    // Paywall Check
    if (mode === 'subscription-required' && !hasActiveSubscription) {
      setGuardState('denied');
      setDenyReason('no-sub');
      return;
    }

    setGuardState('allowed');
  }, [loading, profile, mode, activePage]);

  // Si refusé pour cause d'auth, naviguer vers login automatiquement
  useEffect(() => {
    if (guardState === 'denied' && denyReason === 'unauth' && activePage !== 'home' && activePage !== 'login') {
      onNavigate('login');
    }
  }, [guardState, denyReason, activePage]);

  if (guardState === 'checking' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
        <p className="text-gray-400">Vérification de la sécurité...</p>
      </div>
    );
  }

  if (guardState === 'denied') {
    const messages = {
      'unauth': { 
        icon: Mail, 
        title: 'Connexion requise', 
        subtitle: 'Vous devez être connecté pour accéder à cette page.',
        action: () => onNavigate('home'), 
        actionLabel: 'Aller à l\'accueil' 
      },
      'no-sub': { 
        icon: CreditCard, 
        title: 'Abonnement requis ou Essai terminé', 
        subtitle: 'Votre période d\'essai est terminée ou votre abonnement a expiré.',
        action: () => onNavigate('pricing' as PageId), 
        actionLabel: 'Voir les abonnements' 
      },
      'no-role': { 
        icon: ShieldX, 
        title: 'Accès non autorisé', 
        subtitle: 'Votre rôle ne vous permet pas d\'accéder à cette ressource.',
        action: () => onNavigate('dashboard'), 
        actionLabel: 'Retour au tableau de bord' 
      },
      'no-perm': { 
        icon: ShieldX, 
        title: 'Permissions insuffisantes', 
        subtitle: 'Vous n\'avez pas la permission requise.',
        action: () => onNavigate('dashboard'), 
        actionLabel: 'Retour' 
      },
      'suspended': { 
        icon: ShieldX, 
        title: 'Compte suspendu', 
        subtitle: 'Votre compte a été désactivé par un administrateur.',
        action: () => onNavigate('home'), 
        actionLabel: 'Quitter' 
      },
    };
    
    const m = messages[denyReason];
    const Icon = m.icon;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 text-center">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 max-w-md w-full backdrop-blur-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 mb-6">
            <Icon className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">{m.title}</h1>
          <p className="text-gray-400 mb-8">{m.subtitle}</p>
          <button 
            onClick={m.action}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors"
          >
            {m.actionLabel}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
