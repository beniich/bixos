import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  console.log('Pinging Firestore...');
  try {
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('Ping successful! Found documents:', querySnapshot.size);
  } catch (e) {
    console.error('Ping failed:', e);
  }
  process.exit(0);
}

run();
setTimeout(() => process.exit(1), 10000);
