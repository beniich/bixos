import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface WorkOrder {
  id: string;
  title: string;
  location: string;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  status: 'À faire' | 'En cours' | 'Clôturé';
  dueDate: string;
  equipmentId: string;
  description: string;
  partsUsed?: string;
  photoUrl?: string;
  signatureUrl?: string;
  closedAt?: string;
}

export interface EquipmentHotspot {
  id: string;
  name: string;
  type: 'HVAC' | 'Electrical' | 'Plumbing' | 'Elevator' | 'Fire';
  floor: string;
  status: 'Optimal' | 'Warning' | 'Critical';
  temp: string;
  vibration: string;
  power: string;
  x: number;
  y: number;
  lastMaintenance?: string;
  notes?: string;
}

export interface EnergySetting {
  surfaceArea: number;
  currentBill: number;
  hvacRetrofit: boolean;
  solarPanels: boolean;
  smartBacsBms: boolean;
  electricityRate: number; // €/kWh
}

const STORAGE_KEYS = {
  WORK_ORDERS: 'fieldtech_work_orders_v1',
  EQUIPMENT: 'fieldtech_equipment_v1',
  ENERGY_SETTINGS: 'fieldtech_energy_settings_v1',
};

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'OT-881',
    title: 'Remplacement filtres CVC & vérification courroie',
    location: 'Tour BizOS • Étage 3 R+3',
    priority: 'Haute',
    status: 'À faire',
    dueDate: "Aujourd'hui 14:00",
    equipmentId: 'HVAC-01',
    description: "L'IA a détecté une hausse de perte de charge sur les filtres. Remplacer les caissons filtrants G4.",
  },
  {
    id: 'OT-882',
    title: 'Contrôle variateur & dérive thermique ascenseur',
    location: 'Tour BizOS • Gain Moteur Étage 5',
    priority: 'Haute',
    status: 'En cours',
    dueDate: "Aujourd'hui 16:30",
    equipmentId: 'ELEV-01',
    description: 'Température variateur 62.4°C. Vérifier le système de ventilation auxiliaire et l\'alignement.',
  },
  {
    id: 'OT-880',
    title: 'Graissage préventif roulement pompe circulation',
    location: 'Sous-sol -1 • Chaufferie Centrale',
    priority: 'Moyenne',
    status: 'Clôturé',
    dueDate: 'Hier 11:00',
    equipmentId: 'PUMP-02',
    description: 'Entretien périodique accompli par l\'équipe du matin.',
    partsUsed: 'Graisse hautes performances SKF (150g)',
    closedAt: '2026-08-04 11:30',
  },
];

const INITIAL_EQUIPMENT: EquipmentHotspot[] = [
  { id: 'HVAC-01', name: 'Centrale d\'Air CVC R+3', type: 'HVAC', floor: 'Étage 3', status: 'Warning', temp: '48.2 °C', vibration: '3.8 mm/s', power: '14.2 kW', x: 42, y: 32, lastMaintenance: '2026-07-15' },
  { id: 'ELEC-04', name: 'TGBT Transformateur Principal', type: 'Electrical', floor: 'Sous-sol -1', status: 'Optimal', temp: '34.1 °C', vibration: '0.4 mm/s', power: '128.5 kW', x: 28, y: 72, lastMaintenance: '2026-06-10' },
  { id: 'PUMP-02', name: 'Surpresseur Eau Potable', type: 'Plumbing', floor: 'Sous-sol -1', status: 'Optimal', temp: '22.0 °C', vibration: '1.1 mm/s', power: '5.8 kW', x: 68, y: 76, lastMaintenance: '2026-08-04' },
  { id: 'ELEV-01', name: 'Ascenseur Nord - Variateur', type: 'Elevator', floor: 'Étage 5', status: 'Critical', temp: '62.4 °C', vibration: '7.2 mm/s', power: '22.0 kW', x: 55, y: 18, lastMaintenance: '2026-05-20' },
  { id: 'FIRE-01', name: 'Centrale Sécurité Incendie SDI', type: 'Fire', floor: 'Rez-de-chaussée', status: 'Optimal', temp: '21.5 °C', vibration: '0.1 mm/s', power: '1.2 kW', x: 50, y: 55, lastMaintenance: '2026-07-01' },
];

const INITIAL_ENERGY_SETTINGS: EnergySetting = {
  surfaceArea: 4500,
  currentBill: 185000,
  hvacRetrofit: true,
  solarPanels: true,
  smartBacsBms: true,
  electricityRate: 0.22,
};

// Local storage fallback helpers
export const getStoredWorkOrders = (): WorkOrder[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    return data ? JSON.parse(data) : INITIAL_WORK_ORDERS;
  } catch {
    return INITIAL_WORK_ORDERS;
  }
};

export const saveWorkOrdersLocal = (orders: WorkOrder[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('fieldtech_store_updated'));
  } catch (e) {
    console.error('Failed to save work orders locally', e);
  }
};

export const getStoredEquipment = (): EquipmentHotspot[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    return data ? JSON.parse(data) : INITIAL_EQUIPMENT;
  } catch {
    return INITIAL_EQUIPMENT;
  }
};

export const saveEquipmentLocal = (equip: EquipmentHotspot[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equip));
    window.dispatchEvent(new Event('fieldtech_store_updated'));
  } catch (e) {
    console.error('Failed to save equipment locally', e);
  }
};

export const getStoredEnergySettings = (): EnergySetting => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENERGY_SETTINGS);
    return data ? JSON.parse(data) : INITIAL_ENERGY_SETTINGS;
  } catch {
    return INITIAL_ENERGY_SETTINGS;
  }
};

export const saveEnergySettingsLocal = (settings: EnergySetting) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ENERGY_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('fieldtech_store_updated'));
  } catch (e) {
    console.error('Failed to save energy settings locally', e);
  }
};

// Custom Hook for React Components with Firestore Realtime Sync
export function useFieldTechStore() {
  const [workOrders, setWorkOrdersState] = useState<WorkOrder[]>(getStoredWorkOrders);
  const [equipment, setEquipmentState] = useState<EquipmentHotspot[]>(getStoredEquipment);
  const [energySettings, setEnergySettingsState] = useState<EnergySetting>(getStoredEnergySettings);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Firestore Realtime Listeners
  useEffect(() => {
    // 1. Work Orders listener
    const workOrdersPath = 'work_orders';
    const unsubWorkOrders = onSnapshot(
      collection(db, workOrdersPath),
      async (snapshot) => {
        if (snapshot.empty) {
          // Bootstrap Firestore with initial work orders if empty
          for (const order of INITIAL_WORK_ORDERS) {
            try {
              await setDoc(doc(db, workOrdersPath, order.id), order);
            } catch (err) {
              console.error('Failed to seed work order to Firestore:', err);
            }
          }
        } else {
          const list: WorkOrder[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as WorkOrder);
          });
          setWorkOrdersState(list);
          saveWorkOrdersLocal(list);
        }
      },
      (error) => {
        setIsFirebaseConnected(false);
        handleFirestoreError(error, OperationType.LIST, workOrdersPath);
      }
    );

    // 2. Equipment listener
    const equipmentPath = 'equipment';
    const unsubEquipment = onSnapshot(
      collection(db, equipmentPath),
      async (snapshot) => {
        if (snapshot.empty) {
          // Bootstrap Firestore with initial equipment if empty
          for (const eq of INITIAL_EQUIPMENT) {
            try {
              await setDoc(doc(db, equipmentPath, eq.id), eq);
            } catch (err) {
              console.error('Failed to seed equipment to Firestore:', err);
            }
          }
        } else {
          const list: EquipmentHotspot[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as EquipmentHotspot);
          });
          setEquipmentState(list);
          saveEquipmentLocal(list);
        }
      },
      (error) => {
        setIsFirebaseConnected(false);
        handleFirestoreError(error, OperationType.LIST, equipmentPath);
      }
    );

    // 3. Energy Settings listener
    const energyPath = 'energy_settings';
    const energyDocRef = doc(db, energyPath, 'building_config');
    const unsubEnergy = onSnapshot(
      energyDocRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          try {
            await setDoc(energyDocRef, INITIAL_ENERGY_SETTINGS);
          } catch (err) {
            console.error('Failed to seed energy settings to Firestore:', err);
          }
        } else {
          const data = docSnap.data() as EnergySetting;
          setEnergySettingsState(data);
          saveEnergySettingsLocal(data);
        }
      },
      (error) => {
        setIsFirebaseConnected(false);
        handleFirestoreError(error, OperationType.GET, `${energyPath}/building_config`);
      }
    );

    return () => {
      unsubWorkOrders();
      unsubEquipment();
      unsubEnergy();
    };
  }, []);

  const addWorkOrder = (newOrder: Omit<WorkOrder, 'id'>) => {
    const id = `OT-${Math.floor(883 + Math.random() * 100)}`;
    const fullOrder: WorkOrder = { ...newOrder, id };
    
    // Update local immediately
    const updated = [fullOrder, ...workOrders];
    setWorkOrdersState(updated);
    saveWorkOrdersLocal(updated);

    // Sync to Firestore
    setDoc(doc(db, 'work_orders', id), fullOrder).catch((error) => {
      handleFirestoreError(error, OperationType.WRITE, `work_orders/${id}`);
    });

    return fullOrder;
  };

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const updated = workOrders.map((order) =>
      order.id === id ? { ...order, ...updates } : order
    );
    setWorkOrdersState(updated);
    saveWorkOrdersLocal(updated);

    // Sync to Firestore
    updateDoc(doc(db, 'work_orders', id), updates).catch((error) => {
      // If doc doesn't exist yet, fallback to setDoc
      const existing = workOrders.find((o) => o.id === id);
      if (existing) {
        setDoc(doc(db, 'work_orders', id), { ...existing, ...updates }).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `work_orders/${id}`);
        });
      } else {
        handleFirestoreError(error, OperationType.UPDATE, `work_orders/${id}`);
      }
    });
  };

  const updateEquipmentStatus = (id: string, status: 'Optimal' | 'Warning' | 'Critical', temp?: string) => {
    const updates: Partial<EquipmentHotspot> = { status, ...(temp ? { temp } : {}) };
    const updated = equipment.map((eq) =>
      eq.id === id ? { ...eq, ...updates } : eq
    );
    setEquipmentState(updated);
    saveEquipmentLocal(updated);

    // Sync to Firestore
    updateDoc(doc(db, 'equipment', id), updates).catch((error) => {
      handleFirestoreError(error, OperationType.UPDATE, `equipment/${id}`);
    });
  };

  const updateEnergySettings = (newSettings: Partial<EnergySetting>) => {
    const updated = { ...energySettings, ...newSettings };
    setEnergySettingsState(updated);
    saveEnergySettingsLocal(updated);

    // Sync to Firestore
    setDoc(doc(db, 'energy_settings', 'building_config'), updated).catch((error) => {
      handleFirestoreError(error, OperationType.WRITE, 'energy_settings/building_config');
    });
  };

  return {
    workOrders,
    equipment,
    energySettings,
    isFirebaseConnected,
    addWorkOrder,
    updateWorkOrder,
    updateEquipmentStatus,
    updateEnergySettings,
  };
}
