import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize Firebase when real credentials are provided (not placeholder stubs)
const isConfigured =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith('YOUR_') &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.startsWith('YOUR_');

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('[Firebase] Initialized with project:', firebaseConfig.projectId);
} else {
  console.warn('[Firebase] Running in DEMO mode — no Firebase credentials configured.\nSet VITE_FIREBASE_* in .env.local to enable authentication.');
  // Create minimal mock objects so imports don't crash
  auth = { currentUser: null, onAuthStateChanged: (cb: any) => { cb(null); return () => {}; } } as unknown as Auth;
  db = {} as unknown as Firestore;
}

export { auth, db };
