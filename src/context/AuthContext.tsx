import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';
import { getDeviceId } from '../lib/device-id';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  organizationId: string;
  organizationName: string;
  preferences?: any;
  loyalty?: any;
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
  profile: any; // Keep this for backward compatibility if needed temporarily
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refresh: () => Promise<void>;

  // Nouvelles méthodes EcoAsset / Ticketing
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
  isOrganizer: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Au mount : fetch /me pour voir si cookie session existe
  useEffect(() => {
    loadCurrentUser();
  }, []);
  
  async function loadCurrentUser() {
    try {
      const data = await apiClient.get<{ user: User; subscription: Subscription }>('/api/auth/me');
      setUser(data.user);
      setSubscription(data.subscription);
    } catch (err) {
      // Pas de session → reste déconnecté
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
    
    // Maintenant on fetch /me pour avoir subscription
    await loadCurrentUser();
  }
  
  async function logout() {
    try {
      await apiClient.post('/api/auth/logout', {});
    } finally {
      setUser(null);
      setSubscription(null);
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
  
  async function refresh() {
    await loadCurrentUser();
  }
  
  const value: AuthContextValue = {
    user,
    profile: user,
    subscription,
    loading,
    isAuthenticated: !!user,
    hasActiveSubscription: subscription 
      ? ['trial', 'active'].includes(subscription.status) || user?.role === 'SUPER_ADMIN'
      : false,
    isAdmin: user ? ['SUPER_ADMIN', 'ORG_MANAGER', 'SITE_ADMIN'].includes(user.role) : false,
    isOrganizer: user ? ['ORGANIZER', 'EVENT_MANAGER', 'SUPER_ADMIN'].includes(user.role) : false,
    
    login,
    signIn: login, // alias
    signInWithGoogle: async () => { console.warn('Google Auth via API non implémenté') },
    signUp: async (email, password, name) => { console.warn('Sign Up via API non implémenté') },
    resetPassword: async (email) => { console.warn('Reset password via API non implémenté') },
    
    hasPermission: (resource, action) => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;
      // Logique simple pour l'instant
      return true;
    },

    logout,
    logoutAll,
    refresh,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
