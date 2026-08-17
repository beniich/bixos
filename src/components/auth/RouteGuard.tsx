import React, { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldX, CreditCard, Mail } from 'lucide-react';
import { PageId } from '../../types';
import '../../styles/auth.css';


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
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#141414', gap: 16
      }}>
        <span style={{
          width: 36, height: 36,
          border: '2.5px solid rgba(255,255,255,0.1)',
          borderTopColor: '#f38020',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'auth-spin 0.7s linear infinite'
        }} />
        <p style={{ color: '#888', fontSize: 14 }}>Vérification en cours…</p>
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

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#141414', color: '#fafafa', padding: 24, textAlign: 'center'
      }}>
        <div style={{
          background: '#1e1e1e', border: '1px solid #333',
          borderRadius: 20, padding: '48px 40px', maxWidth: 420, width: '100%'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 28
          }}>
            🔒
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: -0.4 }}>
            {m.title}
          </h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            {m.subtitle}
          </p>
          <button
            onClick={m.action}
            style={{
              width: '100%', padding: '12px 20px', background: '#fafafa',
              color: '#141414', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s'
            }}
          >
            {m.actionLabel}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
