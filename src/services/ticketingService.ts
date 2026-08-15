import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

export interface TicketSeatItem {
  id: string;
  section: string;
  row?: string;
  seatNum?: number;
  price: number;
  type?: 'regular' | 'vip' | 'premium';
}

export interface EcoAssetBooking {
  id: string;
  ticketCode: string;
  eventName: string;
  venueName: string;
  eventDate: string;
  eventTime: string;
  customerName: string;
  customerEmail: string;
  seats: TicketSeatItem[];
  totalPrice: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
  checkedInAt?: string;
  isMock?: boolean;
}

export interface TicketingLog {
  id: string;
  timestamp: string;
  action: string;
  type: 'info' | 'success' | 'warning' | 'error';
  details: string;
}

const STORAGE_KEY_BOOKINGS = 'ecoasset_ticketing_bookings_v2';
const STORAGE_KEY_LOGS = 'ecoasset_ticketing_logs_v2';
const STORAGE_KEY_MODE = 'ecoasset_ticketing_backend_mode';

const DEFAULT_INITIAL_BOOKINGS: EcoAssetBooking[] = [
  {
    id: 'BIZOS-892145',
    ticketCode: 'ECO-2024-892145',
    eventName: 'Finale Arène eSport 2024',
    venueName: 'Arena E-Sport BizOS',
    eventDate: '26 Octobre 2024',
    eventTime: '20:00',
    customerName: 'Alexandre Laurent',
    customerEmail: 'alex.laurent@bizos.io',
    seats: [
      { id: 'g1-5', section: 'Grandstand A', row: '5', seatNum: 12, price: 149, type: 'regular' },
      { id: 'g1-6', section: 'Grandstand A', row: '5', seatNum: 13, price: 149, type: 'regular' }
    ],
    totalPrice: 298,
    status: 'CONFIRMED',
    paymentMethod: 'Carte Bancaire (**** 4242)',
    createdAt: new Date().toISOString(),
    isMock: true
  },
  {
    id: 'BIZOS-443102',
    ticketCode: 'ECO-2024-443102',
    eventName: 'Global Championship Finals 2024',
    venueName: 'Stade BizOS',
    eventDate: '15 Novembre 2024',
    eventTime: '19:30',
    customerName: 'Sophie Martin',
    customerEmail: 'sophie.m@tech.com',
    seats: [
      { id: 'VIP-W1', section: 'VIP West', row: 'A', seatNum: 1, price: 299, type: 'vip' }
    ],
    totalPrice: 299,
    status: 'CHECKED_IN',
    paymentMethod: 'Apple Pay',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    checkedInAt: new Date(Date.now() - 3600000).toISOString(),
    isMock: true
  }
];

export const loadLocalBookings = (): EcoAssetBooking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Unable to read local bookings', e);
  }
  return DEFAULT_INITIAL_BOOKINGS;
};

export const saveLocalBookings = (bookings: EcoAssetBooking[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.warn('Unable to save local bookings', e);
  }
};

export const getBackendModePreference = (): boolean => {
  try {
    const val = localStorage.getItem(STORAGE_KEY_MODE);
    return val ? JSON.parse(val) : true;
  } catch {
    return true;
  }
};

export const saveBackendModePreference = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY_MODE, JSON.stringify(enabled));
  } catch (e) {
    console.warn(e);
  }
};

// Firestore listeners
export const subscribeToFirestoreBookings = (
  onUpdate: (bookings: EcoAssetBooking[]) => void,
  onError?: (err: any) => void
) => {
  const colRef = collection(db, 'ecoasset_bookings');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: EcoAssetBooking[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as EcoAssetBooking;
        items.push({
          ...data,
          id: docSnap.id
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
};

export const saveBookingToFirestore = async (booking: EcoAssetBooking): Promise<boolean> => {
  const path = `ecoasset_bookings/${booking.id}`;
  try {
    const ref = doc(db, 'ecoasset_bookings', booking.id);
    await setDoc(ref, {
      ...booking,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Error saving booking to Firestore:', err);
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch {
      // fallback handled gracefully
    }
    return false;
  }
};

export const updateBookingStatusInFirestore = async (
  bookingId: string, 
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED',
  extra?: Partial<EcoAssetBooking>
): Promise<boolean> => {
  const path = `ecoasset_bookings/${bookingId}`;
  try {
    const ref = doc(db, 'ecoasset_bookings', bookingId);
    await updateDoc(ref, {
      status,
      ...(extra || {}),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Error updating status in Firestore:', err);
    return false;
  }
};

export interface FirestoreSeat {
  id: string;
  section: string;
  row?: string;
  seatNum?: number;
  type?: 'regular' | 'vip' | 'premium';
  price: number;
  status: 'available' | 'occupied' | 'selected';
  bookedBy?: string;
  ticketId?: string;
  updatedAt?: string;
}

export const subscribeToFirestoreSeats = (
  onUpdate: (seats: Record<string, FirestoreSeat>) => void,
  onError?: (err: any) => void
) => {
  const colRef = collection(db, 'ecoasset_seats');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const seatsMap: Record<string, FirestoreSeat> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreSeat;
        seatsMap[docSnap.id] = { ...data, id: docSnap.id };
      });
      onUpdate(seatsMap);
    },
    (err) => {
      console.warn('Firestore seats subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
};

export const updateSeatInFirestore = async (seat: FirestoreSeat): Promise<boolean> => {
  try {
    const ref = doc(db, 'ecoasset_seats', seat.id);
    await setDoc(ref, {
      ...seat,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving seat to Firestore:', err);
    return false;
  }
};

export const subscribeToFirestoreLogs = (
  onUpdate: (logs: TicketingLog[]) => void,
  onError?: (err: any) => void
) => {
  const colRef = collection(db, 'ecoasset_logs');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: TicketingLog[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TicketingLog;
        items.push({ ...data, id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore logs subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
};

export const saveLogToFirestore = async (log: TicketingLog): Promise<boolean> => {
  try {
    const ref = doc(db, 'ecoasset_logs', log.id);
    await setDoc(ref, {
      ...log,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Error saving log to Firestore:', err);
    return false;
  }
};

export interface EcoAssetEvent {
  id: string;
  title: string;
  description: string;
  venueName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  basePrice: number;
  speaker: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  ticketPrices: {
    standard: number;
    premium: number;
    vip: number;
  };
  createdAt?: string;
}

export const subscribeToFirestoreEvents = (
  onUpdate: (events: EcoAssetEvent[]) => void,
  onError?: (err: any) => void
) => {
  const colRef = collection(db, 'ecoasset_events');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: EcoAssetEvent[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as EcoAssetEvent;
        items.push({ ...data, id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore events subscription notice:', err.message);
      if (onError) onError(err);
    }
  );
};

export const saveEventToFirestore = async (event: EcoAssetEvent): Promise<boolean> => {
  try {
    const ref = doc(db, 'ecoasset_events', event.id);
    await setDoc(ref, {
      ...event,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving event to Firestore:', err);
    return false;
  }
};

export const deleteEventInFirestore = async (eventId: string): Promise<boolean> => {
  try {
    const ref = doc(db, 'ecoasset_events', eventId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('Error deleting event in Firestore:', err);
    return false;
  }
};

