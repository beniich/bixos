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
const db = getFirestore(app, "ai-studio-sovereigndevicen-18bec7a3-9311-456d-986d-a6c8f02a8c94");

async function run() {
  console.log('Migrating Blueprint Data...');

  try {
    // Energy Settings
    await setDoc(doc(db, 'energy_settings', 'building_config'), {
      surfaceArea: 1250,
      currentBill: 4500,
      hvacRetrofit: true,
      solarPanels: false,
      smartBacsBms: true,
      electricityRate: 0.18
    });
    console.log('Migrated Energy Settings');

    // Sample Equipment
    await setDoc(doc(db, 'equipment', 'eq-001'), {
      id: 'eq-001',
      name: 'Chiller Unité Nord',
      type: 'HVAC',
      floor: 'R+5',
      status: 'Optimal',
      temp: '18.4°C',
      vibration: '0.8mm/s',
      power: '42.5kW',
      x: 250,
      y: 120,
      lastMaintenance: '2026-07-15'
    });
    console.log('Migrated Sample Equipment');

    // Sample Work Order
    await setDoc(doc(db, 'work_orders', 'wo-991'), {
      id: 'wo-991',
      title: 'Inspection Trimestrielle Chiller',
      location: 'Toiture Aile Nord',
      priority: 'Moyenne',
      status: 'À faire',
      dueDate: '2026-08-15',
      equipmentId: 'eq-001',
      description: 'Vérification des niveaux de fluide frigorigène et nettoyage des condenseurs.'
    });
    console.log('Migrated Sample Work Order');

    console.log('Blueprint Migration Successful!');
  } catch (e) {
    console.error('Blueprint Migration Failed:', e);
  }
  process.exit(0);
}

run();
