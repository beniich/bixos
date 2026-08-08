import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

// 1. Site Location Interface
export interface RealtimeSite {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  status: 'operational' | 'panne' | 'intervention';
  assetCount: number;
  healthScore: number;
  activeFailure?: string;
  technicianAssigned?: string;
  slaRemaining?: string;
  updatedBy?: string;
  updatedAt?: string;
}

// 2. Collaborator / Admin Entry Interface
export interface CollaboratorEntry {
  id: string;
  authorName: string;
  authorRole: 'Admin' | 'Collaborateur' | 'Technicien';
  category: 'Intervention' | 'Panne / Incident' | 'Contrôle Qualité' | 'Modification Site' | 'Note ESG';
  title: string;
  content: string;
  siteId?: string;
  siteName?: string;
  timestamp: string;
  status?: string;
}

// Initial Default Sites if Firestore is empty
export const INITIAL_REALTIME_SITES: RealtimeSite[] = [
  {
    id: 'site-paris',
    name: 'Paris HQ & Tech Tower',
    city: 'Paris',
    country: 'France',
    lat: 48.8566,
    lng: 2.3522,
    status: 'operational',
    assetCount: 340,
    healthScore: 98,
    updatedBy: 'Admin Système',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'site-lyon',
    name: 'Lyon Hub Industrial CVC',
    city: 'Lyon',
    country: 'France',
    lat: 45.7640,
    lng: 4.8357,
    status: 'panne',
    assetCount: 180,
    healthScore: 54,
    activeFailure: 'Surchauffe Compresseur CVC - Pression > 8.4 Bar',
    technicianAssigned: 'Antoine Mercier (FieldTech #402)',
    slaRemaining: '00h 24m',
    updatedBy: 'Tech Antoine',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'site-marseille',
    name: 'Marseille Port & Logistics Terminal',
    city: 'Marseille',
    country: 'France',
    lat: 43.2965,
    lng: 5.3698,
    status: 'intervention',
    assetCount: 210,
    healthScore: 82,
    activeFailure: 'Maintenance préventive pompe de relevage B-02',
    technicianAssigned: 'Sophie Laurent (FieldTech #118)',
    slaRemaining: '01h 45m',
    updatedBy: 'Tech Sophie',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'site-frankfurt',
    name: 'Frankfurt Data Center Cooling Hub',
    city: 'Frankfurt',
    country: 'Germany',
    lat: 50.1109,
    lng: 8.6821,
    status: 'operational',
    assetCount: 520,
    healthScore: 99,
    updatedBy: 'Admin Europe',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'site-london',
    name: 'London Financial Tower Facility',
    city: 'London',
    country: 'UK',
    lat: 51.5074,
    lng: -0.1278,
    status: 'panne',
    assetCount: 290,
    healthScore: 48,
    activeFailure: 'Défaut D’isolement Transformateur HT-01',
    technicianAssigned: 'David Miller (FieldTech #209)',
    slaRemaining: '00h 12m',
    updatedBy: 'Tech David',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_COLLABORATOR_ENTRIES: CollaboratorEntry[] = [
  {
    id: 'entry-101',
    authorName: 'Jean Dupont (Admin)',
    authorRole: 'Admin',
    category: 'Modification Site',
    title: 'Mise à jour statut site de Lyon',
    content: 'Basculement du site en statut Panne Critique suite au rapport d\'alarme CVC.',
    siteId: 'site-lyon',
    siteName: 'Lyon Hub Industrial CVC',
    timestamp: new Date().toISOString()
  },
  {
    id: 'entry-102',
    authorName: 'Sophie Laurent (Tech)',
    authorRole: 'Technicien',
    category: 'Intervention',
    title: 'Début intervention pompe B-02 à Marseille',
    content: 'Arrivée sur site à 13h15. Isolation électrique effectuée, début de vidange du corps de pompe.',
    siteId: 'site-marseille',
    siteName: 'Marseille Port & Logistics Terminal',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

// Custom Hook for Global Realtime Firebase Stores
export function useRealtimeData() {
  const [sites, setSites] = useState<RealtimeSite[]>(INITIAL_REALTIME_SITES);
  const [entries, setEntries] = useState<CollaboratorEntry[]>(INITIAL_COLLABORATOR_ENTRIES);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Firestore Realtime Listeners
  useEffect(() => {
    // 1. Sites Realtime Listener
    const sitesPath = 'sites';
    const unsubSites = onSnapshot(
      collection(db, sitesPath),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed Firestore if empty
          for (const s of INITIAL_REALTIME_SITES) {
            try {
              await setDoc(doc(db, sitesPath, s.id), s);
            } catch (err) {
              console.error('Failed to seed site to Firestore:', err);
            }
          }
        } else {
          const list: RealtimeSite[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as RealtimeSite);
          });
          setSites(list);
          setIsLiveConnected(true);
        }
      },
      (error) => {
        setIsLiveConnected(false);
        handleFirestoreError(error, OperationType.LIST, sitesPath);
      }
    );

    // 2. Collaborator Entries Realtime Listener
    const entriesPath = 'collaborator_entries';
    const unsubEntries = onSnapshot(
      collection(db, entriesPath),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial entries
          for (const entry of INITIAL_COLLABORATOR_ENTRIES) {
            try {
              await setDoc(doc(db, entriesPath, entry.id), entry);
            } catch (err) {
              console.error('Failed to seed entry to Firestore:', err);
            }
          }
        } else {
          const list: CollaboratorEntry[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as CollaboratorEntry);
          });
          // Sort newest first
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setEntries(list);
          setIsLiveConnected(true);
        }
      },
      (error) => {
        setIsLiveConnected(false);
        handleFirestoreError(error, OperationType.LIST, entriesPath);
      }
    );

    return () => {
      unsubSites();
      unsubEntries();
    };
  }, []);

  // Actions synced directly to Firestore
  const addSite = async (newSite: Omit<RealtimeSite, 'id'>) => {
    const id = `site-${Date.now().toString(36)}`;
    const fullSite: RealtimeSite = {
      ...newSite,
      id,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'sites', id), fullSite);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `sites/${id}`);
    }
  };

  const updateSiteStatus = async (
    siteId: string, 
    status: 'operational' | 'panne' | 'intervention', 
    activeFailure?: string,
    technicianAssigned?: string,
    updatedBy: string = 'Admin / Collaborateur'
  ) => {
    const updates: Partial<RealtimeSite> = {
      status,
      activeFailure: activeFailure || '',
      technicianAssigned: technicianAssigned || '',
      updatedBy,
      updatedAt: new Date().toISOString()
    };
    try {
      await updateDoc(doc(db, 'sites', siteId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `sites/${siteId}`);
    }
  };

  const addCollaboratorEntry = async (entry: Omit<CollaboratorEntry, 'id' | 'timestamp'>) => {
    const id = `entry-${Date.now().toString(36)}`;
    const fullEntry: CollaboratorEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'collaborator_entries', id), fullEntry);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `collaborator_entries/${id}`);
    }
  };

  return {
    sites,
    entries,
    isLiveConnected,
    addSite,
    updateSiteStatus,
    addCollaboratorEntry
  };
}
