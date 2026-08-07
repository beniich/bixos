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
  console.log('Attempting to write to Firestore...');
  try {
    await setDoc(doc(db, 'test_collection', 'test_doc'), { hello: 'world', timestamp: new Date().toISOString() });
    console.log('Write successful!');
  } catch (e) {
    console.error('Write failed:', e);
  }
  process.exit(0);
}

run();

// Safety timeout
setTimeout(() => {
  console.log('Script timed out internally.');
  process.exit(1);
}, 30000);
