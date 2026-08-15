// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'CUSTOMER' | 'ORGANIZER' | 'EVENT_MANAGER' | 'SCANNER' | 'SUPER_ADMIN';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: number;
  lastLoginAt: number;
  preferences?: {
    language: 'fr' | 'en' | 'es';
    currency: 'EUR' | 'USD' | 'GBP';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  organizerProfile?: {
    companyName?: string;
    vatNumber?: string;
    payoutMethods?: PayoutMethod[];
    verified: boolean;
  };
  loyalty?: {
    points: number;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    totalSpent: number;
  };
}

interface PayoutMethod {
  id: string;
  type: 'BANK_ACCOUNT' | 'PAYPAL';
  details: Record<string, string>;
  verified: boolean;
  isDefault: boolean;
}

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'CUSTOMER'
): Promise<AppUser> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = credential.user;

  await updateProfile(firebaseUser, { displayName });
  await sendEmailVerification(firebaseUser);

  const userData: AppUser = {
    uid: firebaseUser.uid,
    email,
    displayName,
    photoURL: firebaseUser.photoURL || undefined,
    role,
    emailVerified: false,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    preferences: {
      language: 'fr',
      currency: 'EUR',
      notifications: { email: true, push: true, sms: false }
    },
    loyalty: { points: 0, tier: 'BRONZE', totalSpent: 0 }
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  });

  return userData;
};

/**
 * Connexion par email/password
 */
export const login = async (email: string, password: string): Promise<AppUser> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return await getUserProfile(credential.user.uid);
};

/**
 * Connexion via Google
 */
export const loginWithGoogle = async (): Promise<AppUser> => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  const credential = await signInWithPopup(auth, provider);
  const firebaseUser = credential.user;

  // Vérifier si l'utilisateur existe déjà
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: AppUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || 'Utilisateur',
      photoURL: firebaseUser.photoURL || undefined,
      role: 'CUSTOMER',
      emailVerified: firebaseUser.emailVerified,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: {
        language: 'fr',
        currency: 'EUR',
        notifications: { email: true, push: true, sms: false }
      },
      loyalty: { points: 0, tier: 'BRONZE', totalSpent: 0 }
    };

    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

    return userData;
  }

  await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
  return { ...(userSnap.data() as AppUser), uid: firebaseUser.uid };
};

/**
 * Déconnexion
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
  localStorage.removeItem('ecoasset_cart');
};

/**
 * Réinitialisation du mot de passe
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Récupération du profil utilisateur depuis Firestore
 */
export const getUserProfile = async (uid: string): Promise<AppUser> => {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) {
    throw new Error('Profil utilisateur introuvable');
  }
  return { ...(userSnap.data() as AppUser), uid };
};

/**
 * Mise à jour du profil
 */
export const updateUserProfile = async (
  uid: string,
  data: Partial<AppUser>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data);
};

/**
 * Vérification du mot de passe
 */
export const verifyCurrentPassword = async (password: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user || !user.email) return false;

  try {
    await signInWithEmailAndPassword(auth, user.email, password);
    return true;
  } catch {
    return false;
  }
};

/**
 * Observer les changements d'état d'authentification
 */
export const onAuthChange = (callback: (user: AppUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      const profile = await getUserProfile(firebaseUser.uid);
      callback(profile);
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      callback(null);
    }
  });
};

/**
 * Vérification des permissions
 */
export const hasPermission = (
  user: AppUser | null,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;

  const permissions: Record<UserRole, Record<string, ('create' | 'read' | 'update' | 'delete')[]>> = {
    CUSTOMER: {
      booking: ['create', 'read'],
      review: ['create', 'read', 'update', 'delete'],
      user: ['read', 'update']
    },
    SCANNER: {
      ticket: ['read', 'update'],
      booking: ['read']
    },
    ORGANIZER: {
      event: ['create', 'read', 'update'],
      booking: ['read'],
      venue: ['create', 'read', 'update']
    },
    EVENT_MANAGER: {
      event: ['create', 'read', 'update', 'delete'],
      booking: ['read', 'update'],
      venue: ['create', 'read', 'update', 'delete'],
      speaker: ['create', 'read', 'update', 'delete'],
      analytics: ['read']
    },
    SUPER_ADMIN: {
      '*': ['create', 'read', 'update', 'delete']
    }
  };

  const rolePerms = permissions[user.role];
  if (!rolePerms) return false;

  const resourcePerms = rolePerms['*'] || rolePerms[resource];
  return resourcePerms?.includes(action) || false;
};
