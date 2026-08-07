import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9sNmvPQW83Ov6qD-Wxt8yhS87X8Zq9-A",
  authDomain: "tribal-domain-j9v0l.firebaseapp.com",
  projectId: "tribal-domain-j9v0l",
  storageBucket: "tribal-domain-j9v0l.firebasestorage.app",
  messagingSenderId: "326625297127",
  appId: "1:326625297127:web:275b317393e7b2376fd842"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log('Testing write to tribal-domain-j9v0l...');
  try {
    // Disable offline persistence to force a network check
    // Actually in Node.js it's disabled by default
    await setDoc(doc(db, 'test', 'write_test'), { date: new Date().toISOString() });
    console.log('WRITE SUCCESS!');
  } catch (e) {
    console.error('WRITE ERROR:', e);
  }
  process.exit(0);
}

run();
setTimeout(() => {
  console.log('Forced exit after 15s');
  process.exit(1);
}, 15000);
