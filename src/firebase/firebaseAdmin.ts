import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccountStr) {
    try {
      const serviceAccount = JSON.parse(serviceAccountStr);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } catch (e) {
      console.error('[Firebase Admin] Erreur lors du parsing de FIREBASE_SERVICE_ACCOUNT_KEY', e);
      initializeApp();
    }
  } else {
    initializeApp();
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
