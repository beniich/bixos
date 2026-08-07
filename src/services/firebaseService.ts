import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ===== DATA FETCHING SERVICE (FIRESTORE) =====

export const firebaseService = {
  // Members
  async getMembers(orgId?: string) {
    const membersRef = collection(db, 'members');
    const q = orgId ? query(membersRef, where('orgId', '==', orgId)) : membersRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addMember(memberData: any) {
    const membersRef = collection(db, 'members');
    return await addDoc(membersRef, {
      ...memberData,
      createdAt: Timestamp.now()
    });
  },

  // Spaces
  async getSpaces() {
    const spacesRef = collection(db, 'spaces');
    const snapshot = await getDocs(spacesRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // Bookings
  async getBookings() {
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async createBooking(bookingData: any) {
    const bookingsRef = collection(db, 'bookings');
    return await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: Timestamp.now()
    });
  },

  // Work Orders
  async getWorkOrders() {
    const woRef = collection(db, 'work_orders');
    const snapshot = await getDocs(woRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // Equipment
  async getEquipment() {
    const eqRef = collection(db, 'equipment');
    const snapshot = await getDocs(eqRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};
