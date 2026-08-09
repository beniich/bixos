import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  googleProvider,
  auth,
  db
} from '../services/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { UserRole } from '../types/database';

export type SubscriptionStatus =
  | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'suspended';

export interface OrgInfo {
  id: string;
  name: string;
  role: UserRole;
}

export interface UserProfile {
  // Identity
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone: string | null;
  
  // Tenant
  organizationId: string;
  organizationName: string;
  allowedOrganizations: OrgInfo[];
  
  // Role & permissions
  role: UserRole;
  permissions: string[];
  
  // Subscription / monetization
  subscriptionStatus: SubscriptionStatus;
  plan: 'trial' | 'starter' | 'pro' | 'enterprise';
  planExpiresAt: number | null; // timestamp ms
  trialEndsAt: number | null;
  seatsIncluded: number;
  seatsUsed: number;
  
  // Status
  isActive: boolean;
  isSuspended: boolean;
  
  // Timestamps
  lastLoginAt: number;
  createdAt: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  isAdmin: boolean;

  // Methods
  loginWithGoogle: () => Promise<void>;
  login: (email: string, password: string, opts?: any) => Promise<any>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  switchOrganization: (orgId: string, orgName: string) => Promise<void>;
  createOrganization: (orgName: string) => Promise<string>;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const DEFAULT_ORGS: OrgInfo[] = [
  { id: 'org_bizos_global', name: 'BizOS - Siège Global Operations', role: 'SUPER_ADMIN' },
  { id: 'org_facility_paris', name: 'Facility Management Paris IDF', role: 'SITE_ADMIN' },
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  hasActiveSubscription: false,
  isAdmin: false,
  loginWithGoogle: async () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateRole: async () => {},
  switchOrganization: async () => {},
  createOrganization: async () => '',
  hasPermission: () => false,
  hasAnyRole: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ============== LOAD USER PROFILE FROM FIRESTORE ==============
  const loadUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      
      let data: any = {};
      
      if (!userDoc.exists()) {
        console.warn('[AUTH] Profil inexistant, création profil par défaut pour démo');
        data = {
          displayName: fbUser.displayName || 'Nouvel Utilisateur',
          role: 'SUPER_ADMIN',
          organizationId: 'org_bizos_global',
          organizationName: 'BizOS - Siège Global Operations',
          allowedOrganizations: DEFAULT_ORGS,
          status: 'ACTIVE',
        };
        await setDoc(doc(db, 'users', fbUser.uid), data, { merge: true });
      } else {
        data = userDoc.data();
      }
      
      if (data.status === 'SUSPENDED' || data.status === 'INACTIVE') {
        return {
          ...data,
          uid: fbUser.uid,
          email: fbUser.email,
          isActive: false,
          isSuspended: data.status === 'SUSPENDED',
          subscriptionStatus: 'suspended'
        } as UserProfile;
      }
      
      const orgId = data.organizationId || 'org_bizos_global';
      let orgData: any = {};
      
      try {
        const orgDoc = await getDoc(doc(db, 'organizations', orgId));
        if (orgDoc.exists()) orgData = orgDoc.data();
      } catch (e) { console.warn("Erreur lecture org", e); }
      
      const now = Date.now();
      const planExpiresAt = orgData.planExpiresAt || null;
      // Par défaut pour un nouveau test, essai gratuit de 14j.
      const trialEndsAt = orgData.trialEndsAt || (now + 14 * 24 * 60 * 60 * 1000); 
      
      let subscriptionStatus: SubscriptionStatus = orgData.subscriptionStatus || 'trial';
      
      if (planExpiresAt && planExpiresAt < now) {
        subscriptionStatus = 'expired';
      }
      if (trialEndsAt && trialEndsAt < now && subscriptionStatus === 'trial') {
        subscriptionStatus = 'expired';
      }
      
      return {
        uid: fbUser.uid,
        email: fbUser.email ?? null,
        displayName: data.displayName ?? fbUser.displayName ?? '',
        photoURL: fbUser.photoURL,
        phone: fbUser.phoneNumber,
        organizationId: orgId,
        organizationName: orgData.name ?? data.organizationName ?? 'Ma Startup',
        allowedOrganizations: data.allowedOrganizations ?? DEFAULT_ORGS,
        role: data.role as UserRole ?? 'COLLABORATOR',
        permissions: data.permissions ?? [],
        subscriptionStatus,
        plan: orgData.plan ?? 'trial',
        planExpiresAt,
        trialEndsAt,
        seatsIncluded: orgData.seatsIncluded ?? 5,
        seatsUsed: orgData.seatsUsed ?? 0,
        isActive: data.status !== 'SUSPENDED' && data.status !== 'INACTIVE',
        isSuspended: data.status === 'SUSPENDED',
        lastLoginAt: data.lastLoginAt ?? Date.now(),
        createdAt: data.createdAt ?? Date.now(),
      };
    } catch (err) {
      console.error('[AUTH] Failed to load profile', err);
      return null;
    }
  };

  // ============== AUTH STATE LISTENER ==============
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (!fbUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setUser(fbUser);
      const userProf = await loadUserProfile(fbUser);
      setProfile(userProf);
      setLoading(false);
      
      if (userProf) {
        setDoc(doc(db, 'users', fbUser.uid), { lastLoginAt: Date.now() }, { merge: true }).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  // ============== REAL-TIME PROFILE & ORG LISTENER ==============
  useEffect(() => {
    if (!user) return;
    
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), async (snap) => {
      if (snap.exists()) {
        const p = await loadUserProfile(user);
        setProfile(p);
      }
    });

    let unsubOrg: (() => void) | null = null;
    if (profile?.organizationId) {
      unsubOrg = onSnapshot(doc(db, 'organizations', profile.organizationId), async () => {
        const p = await loadUserProfile(user);
        setProfile(p);
      });
    }

    return () => {
      unsubUser();
      if (unsubOrg) unsubOrg();
    };
  }, [user, profile?.organizationId]);


  // ============== METHODS ==============
  const loginWithGoogle = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (error) { console.error('Error signing in with Google:', error); throw error; }
  };

  const login = async (email: string, password: string, opts?: any): Promise<any> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...opts }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.accessToken) localStorage.setItem('biz_access_token', data.accessToken);
        return { success: true, accessToken: data.accessToken };
      }
      return { success: false, error: data.message || data.error };
    } catch {
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<any> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.message || data.error };
    } catch {
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) { console.error('Error signing out:', error); }
  };

  const updateRole = async (role: UserRole) => {
    if (!user || !profile) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { role, updatedAt: Date.now() }, { merge: true });
    } catch (err) { console.error('Failed to update role', err); }
  };

  const switchOrganization = async (orgId: string, orgName: string) => {
    if (!user || !profile) return;
    const targetOrg = profile.allowedOrganizations.find(o => o.id === orgId);
    const newRole = targetOrg ? targetOrg.role : 'COLLABORATOR';
    try {
      await setDoc(doc(db, 'users', user.uid), { 
        organizationId: orgId, organizationName: orgName, role: newRole 
      }, { merge: true });
    } catch (err) { console.error('Failed to switch org', err); }
  };

  const createOrganization = async (orgName: string): Promise<string> => {
    const orgId = `org_${Date.now()}`;
    if (profile && user) {
      const newOrgInfo: OrgInfo = { id: orgId, name: orgName, role: 'SUPER_ADMIN' };
      const updatedAllowed = [...profile.allowedOrganizations, newOrgInfo];
      
      await setDoc(doc(db, 'users', user.uid), { 
        organizationId: orgId, organizationName: orgName, role: 'SUPER_ADMIN', allowedOrganizations: updatedAllowed
      }, { merge: true });

      await setDoc(doc(db, 'organizations', orgId), {
        id: orgId, name: orgName, createdBy: user.uid, createdAt: Date.now(),
        subscriptionStatus: 'trial', trialEndsAt: Date.now() + 14 * 24 * 60 * 60 * 1000
      });
    }
    return orgId;
  };

  // ============== HELPERS ==============
  const hasActiveSubscription = (() => {
    if (!profile) return false;
    if (profile.role === 'SUPER_ADMIN') return true; 
    return ['trial', 'active'].includes(profile.subscriptionStatus);
  })();

  const isAdmin = (() => {
    if (!profile) return false;
    return ['SUPER_ADMIN', 'ORG_MANAGER', 'SITE_ADMIN'].includes(profile.role);
  })();

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    if (profile.role === 'SUPER_ADMIN') return true;
    return profile.permissions.includes(permission);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, 
      isAuthenticated: !!user && !!profile,
      hasActiveSubscription, isAdmin,
      loginWithGoogle, login, register, logout, updateRole, switchOrganization, createOrganization,
      hasPermission, hasAnyRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
