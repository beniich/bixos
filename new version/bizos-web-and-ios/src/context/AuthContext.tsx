import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  googleProvider,
  auth,
  db
} from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface OrgInfo {
  id: string;
  name: string;
  role: 'Admin' | 'Collaborateur' | 'Technicien';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'Admin' | 'Collaborateur' | 'Technicien';
  organizationId: string;
  organizationName: string;
  allowedOrganizations: OrgInfo[];
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: 'Admin' | 'Collaborateur' | 'Technicien') => Promise<void>;
  switchOrganization: (orgId: string, orgName: string) => Promise<void>;
  createOrganization: (orgName: string) => Promise<string>;
}

const DEFAULT_ORGS: OrgInfo[] = [
  { id: 'org_bizos_global', name: 'BizOS - Siège Global Operations', role: 'Admin' },
  { id: 'org_facility_paris', name: 'Facility Management Paris IDF', role: 'Admin' },
  { id: 'org_lyon_industrial', name: 'Site Industriel Lyon Sud', role: 'Collaborateur' },
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  updateRole: async () => {},
  switchOrganization: async () => {},
  createOrganization: async () => '',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create Firestore user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: data.displayName || firebaseUser.displayName || 'Utilisateur BizOS',
              photoURL: data.photoURL || firebaseUser.photoURL,
              role: data.role || 'Admin',
              organizationId: data.organizationId || 'org_bizos_global',
              organizationName: data.organizationName || 'BizOS - Siège Global Operations',
              allowedOrganizations: data.allowedOrganizations || DEFAULT_ORGS,
              createdAt: data.createdAt,
              lastLoginAt: new Date().toISOString(),
            });
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Utilisateur BizOS',
              photoURL: firebaseUser.photoURL,
              role: 'Admin', // Default role for main user (Multi-Admin enabled)
              organizationId: 'org_bizos_global',
              organizationName: 'BizOS - Siège Global Operations',
              allowedOrganizations: DEFAULT_ORGS,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Error loading user profile from Firestore:', err);
          // Fallback profile if Firestore read fails
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Utilisateur BizOS',
            photoURL: firebaseUser.photoURL,
            role: 'Admin',
            organizationId: 'org_bizos_global',
            organizationName: 'BizOS - Siège Global Operations',
            allowedOrganizations: DEFAULT_ORGS,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateRole = async (role: 'Admin' | 'Collaborateur' | 'Technicien') => {
    if (!user || !profile) return;
    const userRef = doc(db, 'users', user.uid);
    const updated = { ...profile, role, lastLoginAt: new Date().toISOString() };
    try {
      await setDoc(userRef, updated, { merge: true });
      setProfile(updated);
    } catch (err) {
      console.error('Failed to update role in Firestore:', err);
    }
  };

  const switchOrganization = async (orgId: string, orgName: string) => {
    if (!user || !profile) return;
    const userRef = doc(db, 'users', user.uid);
    // Find matching org role or default to Admin
    const targetOrg = profile.allowedOrganizations.find(o => o.id === orgId);
    const newRole = targetOrg ? targetOrg.role : 'Admin';

    const updated = {
      ...profile,
      organizationId: orgId,
      organizationName: orgName,
      role: newRole,
      lastLoginAt: new Date().toISOString(),
    };

    try {
      await setDoc(userRef, updated, { merge: true });
      setProfile(updated);
    } catch (err) {
      console.error('Failed to switch organization in Firestore:', err);
      // Local fallback state
      setProfile(updated);
    }
  };

  const createOrganization = async (orgName: string): Promise<string> => {
    const orgId = `org_${Date.now()}`;
    const newOrgInfo: OrgInfo = { id: orgId, name: orgName, role: 'Admin' };

    if (profile && user) {
      const updatedAllowed = [...(profile.allowedOrganizations || []), newOrgInfo];
      const updatedProfile: UserProfile = {
        ...profile,
        organizationId: orgId,
        organizationName: orgName,
        role: 'Admin',
        allowedOrganizations: updatedAllowed,
      };

      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, updatedProfile, { merge: true });
        // Also seed organization doc in Firestore
        const orgRef = doc(db, 'organizations', orgId);
        await setDoc(orgRef, {
          id: orgId,
          name: orgName,
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
          adminUids: [user.uid],
        });
        setProfile(updatedProfile);
      } catch (err) {
        console.error('Failed to create org in Firestore:', err);
        setProfile(updatedProfile);
      }
    }
    return orgId;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      loginWithGoogle, 
      logout, 
      updateRole,
      switchOrganization,
      createOrganization
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

