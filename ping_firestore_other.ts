import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9sNmvPQW83Ov6qD-Wxt8yhS87X8Zq9-A", // Keeping same API key for now, might fail if different
  projectId: "com-example-bizosapp-6f827"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log('Pinging OTHER Firestore (com-example-bizosapp-6f827)...');
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
