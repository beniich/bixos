import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOvljv1D8hhL6XvLahVMLXEHPZdul3fpM",
  projectId: "com-example-bizosapp-6f827"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log('Testing write to com-example-bizosapp-6f827...');
  try {
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
