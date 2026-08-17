import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';
import { getDeviceId } from '../lib/device-id';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  organizationId: string;
  organizationName: string;
  preferences?: any;
  loyalty?: any;
  photoURL?: string;
  phone?: string | null;
  permissions?: string[];
  allowedOrganizations?: any[];
  subscriptionStatus?: string;
  plan?: string;
  planExpiresAt?: number | null;
  trialEndsAt?: number | null;
  seatsIncluded?: number;
  seatsUsed?: number;
  isActive?: boolean;
  isSuspended?: boolean;
  createdAt?: number;
  lastLoginAt?: number;
}

interface Subscription {
  status: string;
  plan: string;
  expiresAt?: string;
}

interface AuthContextValue {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  needsVerification: boolean;
  profile: any; // backward compat

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refresh: () => Promise<void>;

  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resendVerification: (email?: string) => Promise<void>;

  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => { loadCurrentUser(); }, []);

  async function loadCurrentUser() {
    try {
      const data = await apiClient.get<{ user: User; subscription: Subscription }>('/api/auth/me');
      setUser(data.user);
      setSubscription(data.subscription);
      setNeedsVerification(false);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    await apiClient.post<{ user: User }>('/api/auth/login', {
      email,
      password,
      deviceId: getDeviceId(),
    });
    await loadCurrentUser();
  }

  async function logout() {
    try {
      await apiClient.post('/api/auth/logout', {});
    } finally {
      setUser(null);
      setSubscription(null);
      setNeedsVerification(false);
      setPendingEmail(null);
      localStorage.removeItem('ecoasset_user');
    }
  }

  async function logoutAll() {
    try {
      await apiClient.post('/api/auth/logout-all', {});
    } finally {
      setUser(null);
      setSubscription(null);
    }
  }

  async function refresh() { await loadCurrentUser(); }

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    await apiClient.post<{ user: User }>('/api/auth/register', {
      email,
      password,
      name,
      deviceId: getDeviceId(),
    });
    setPendingEmail(email);
    setNeedsVerification(true);
    // ne pas charger la session â€” email non vÃ©rifiÃ©
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await apiClient.post('/api/auth/forgot-password', { email });
  }, []);

  const resetPassword = forgotPassword; // alias

  const resendVerification = useCallback(async (email?: string) => {
    const target = email || pendingEmail;
    if (!target) return;
    await apiClient.post('/api/auth/resend-verification', { email: target });
  }, [pendingEmail]);

  const signInWithGoogle = useCallback(async () => {
    // Redirige vers OAuth Google
    const apiBase = (import.meta as any).env?.VITE_API_BASE_URL ?? '';
    window.location.href = `${apiBase}/api/auth/google`;
  }, []);

  const signInWithGithub = useCallback(async () => {
    const apiBase = (import.meta as any).env?.VITE_API_BASE_URL ?? '';
    window.location.href = `${apiBase}/api/auth/github`;
  }, []);

  const hasPermission = useCallback(
    (resource: string, action: 'create' | 'read' | 'update' | 'delete') => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;
      return true; // TODO: map role permissions
    },
    [user]
  );

  const value: AuthContextValue = {
    user,
    profile: user, // backward compat
    subscription,
    loading,
    isAuthenticated: !!user,
    hasActiveSubscription: subscription
      ? ['trial', 'active'].includes(subscription.status) || user?.role === 'SUPER_ADMIN'
      : false,
    isAdmin: user ? ['SUPER_ADMIN', 'ORG_MANAGER', 'SITE_ADMIN'].includes(user.role) : false,
    isOrganizer: user ? ['ORGANIZER', 'EVENT_MANAGER', 'SUPER_ADMIN'].includes(user.role) : false,
    needsVerification,

    login,
    signIn: login,
    signInWithGoogle,
    signInWithGithub,
    signUp,
    logout,
    logoutAll,
    refresh,
    resetPassword,
    forgotPassword,
    resendVerification,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

