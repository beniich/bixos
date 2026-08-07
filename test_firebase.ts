import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9sNmvPQW83Ov6qD-Wxt8yhS87X8Zq9-A",
  authDomain: "tribal-domain-j9v0l.firebaseapp.com",
  projectId: "tribal-domain-j9v0l",
  storageBucket: "tribal-domain-j9v0l.firebasestorage.app",
  messagingSenderId: "326625297127",
  appId: "1:326625297127:web:275b317393e7b2376fd842"
};

console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('Firebase initialized.');
process.exit(0);
