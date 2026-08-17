/**
 * ticketService.ts
 * Firestore CRUD + realtime subscriptions pour la collection `tickets`.
 * Compatible avec le type TicketData défini dans src/types/ticket.ts.
 */

import { db } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { TicketData } from '../types/ticket';

// ============================================
// HELPERS
// ============================================

/** Vérifie si Firestore est réellement initialisé (pas le mock vide). */
const isFirestoreAvailable = (): boolean => {
  return !!(db && (db as any).app);
};

// ============================================
// READ — GET ALL TICKETS FOR AN EVENT
// ============================================

/**
 * Récupère tous les billets d'un événement (one-shot).
 * Retourne un tableau vide si Firestore n'est pas configuré.
 */
export const getEventTickets = async (eventId: string): Promise<TicketData[]> => {
  if (!isFirestoreAvailable()) {
    console.warn('[ticketService] Firestore not configured, returning empty array.');
    return [];
  }
  try {
    const q = query(
      collection(db, 'tickets'),
      where('eventId', '==', eventId),
      orderBy('issuedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as TicketData));
  } catch (err: any) {
    // Index manquant ou permissions — on log et on retourne []
    console.warn('[ticketService] getEventTickets error:', err?.message ?? err);
    return [];
  }
};

// ============================================
// REALTIME SUBSCRIPTION
// ============================================

/**
 * Souscription temps réel à la collection `tickets` pour un événement.
 * Retourne la fonction de désabonnement.
 */
export const subscribeToEventTickets = (
  eventId: string,
  onUpdate: (tickets: TicketData[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!isFirestoreAvailable()) {
    console.warn('[ticketService] Firestore not configured, subscription is a no-op.');
    return () => {};
  }

  const q = query(
    collection(db, 'tickets'),
    where('eventId', '==', eventId),
    orderBy('issuedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets: TicketData[] = snapshot.docs.map(
        (d) => ({ ...d.data(), id: d.id } as TicketData)
      );
      onUpdate(tickets);
    },
    (err) => {
      console.warn('[ticketService] realtime error:', err?.message ?? err);
      if (onError) onError(err);
    }
  );
};

// ============================================
// WRITE — SAVE SINGLE TICKET
// ============================================

export const saveTicketToFirestore = async (ticket: TicketData): Promise<boolean> => {
  if (!isFirestoreAvailable()) return false;
  try {
    const ref = doc(db, 'tickets', ticket.id);
    await setDoc(
      ref,
      {
        ...ticket,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    return true;
  } catch (err: any) {
    console.error('[ticketService] saveTicket error:', err?.message ?? err);
    return false;
  }
};

// ============================================
// WRITE — BATCH SAVE (génération en masse)
// ============================================

/**
 * Sauvegarde un lot de billets en une seule transaction batch.
 * Firestore limite les batches à 500 docs — on découpe automatiquement.
 */
export const saveTicketsBatch = async (tickets: TicketData[]): Promise<{ saved: number; failed: number }> => {
  if (!isFirestoreAvailable() || tickets.length === 0) {
    return { saved: 0, failed: tickets.length };
  }

  const CHUNK_SIZE = 490; // sécurité sous la limite 500
  let saved = 0;
  let failed = 0;

  for (let i = 0; i < tickets.length; i += CHUNK_SIZE) {
    const chunk = tickets.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    const now = Date.now();

    chunk.forEach((ticket) => {
      const ref = doc(db, 'tickets', ticket.id);
      batch.set(ref, { ...ticket, updatedAt: now }, { merge: true });
    });

    try {
      await batch.commit();
      saved += chunk.length;
    } catch (err: any) {
      console.error('[ticketService] batch commit error:', err?.message ?? err);
      failed += chunk.length;
    }
  }

  return { saved, failed };
};

// ============================================
// UPDATE STATUS
// ============================================

/**
 * Met à jour le statut d'un billet (VALID → USED | CANCELLED | REFUNDED).
 */
export const updateTicketStatus = async (
  ticketId: string,
  status: TicketData['status'],
  extra?: Partial<Pick<TicketData, 'gate'>>
): Promise<boolean> => {
  if (!isFirestoreAvailable()) return false;
  try {
    const ref = doc(db, 'tickets', ticketId);
    await updateDoc(ref, {
      status,
      ...(extra ?? {}),
      updatedAt: Date.now(),
    });
    return true;
  } catch (err: any) {
    console.error('[ticketService] updateStatus error:', err?.message ?? err);
    return false;
  }
};

// ============================================
// DELETE
// ============================================

export const deleteTicket = async (ticketId: string): Promise<boolean> => {
  if (!isFirestoreAvailable()) return false;
  try {
    await deleteDoc(doc(db, 'tickets', ticketId));
    return true;
  } catch (err: any) {
    console.error('[ticketService] deleteTicket error:', err?.message ?? err);
    return false;
  }
};

// ============================================
// CHECK-IN (scan QR)
// ============================================

export interface CheckInResult {
  success: boolean;
  ticket?: TicketData;
  reason?: 'NOT_FOUND' | 'ALREADY_USED' | 'CANCELLED' | 'ERROR';
}

/**
 * Valide un billet via son ID (extrait du QR).
 * Le marque USED si valide, sinon retourne la raison d'échec.
 */
export const checkInTicket = async (ticketId: string): Promise<CheckInResult> => {
  if (!isFirestoreAvailable()) return { success: false, reason: 'ERROR' };

  try {
    const snapshot = await getDocs(
      query(collection(db, 'tickets'), where('id', '==', ticketId))
    );

    if (snapshot.empty) return { success: false, reason: 'NOT_FOUND' };

    const docSnap = snapshot.docs[0];
    const ticket = { ...docSnap.data(), id: docSnap.id } as TicketData;

    if (ticket.status === 'USED') return { success: false, reason: 'ALREADY_USED', ticket };
    if (ticket.status === 'CANCELLED') return { success: false, reason: 'CANCELLED', ticket };

    await updateDoc(docSnap.ref, {
      status: 'USED',
      checkedInAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, ticket: { ...ticket, status: 'USED' } };
  } catch (err: any) {
    console.error('[ticketService] checkIn error:', err?.message ?? err);
    return { success: false, reason: 'ERROR' };
  }
};
