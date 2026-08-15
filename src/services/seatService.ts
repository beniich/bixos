/**
 * seatService.ts
 * Gestion des sièges : layout, disponibilité, hold temporaire (10min)
 * Firestore temps-réel + transactions atomiques
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Seat, SeatHold, SeatStatus, VenueLayout, SeatSection, SeatCategory } from '../types/seat';

const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// ─────────────────────────────────────────────────
// VENUE LAYOUT
// ─────────────────────────────────────────────────

/**
 * Récupère le plan complet d'un lieu (sections + sièges + catégories)
 */
export const getVenueLayout = async (venueId: string): Promise<VenueLayout | null> => {
  const venueSnap = await getDoc(doc(db, 'ecoasset_venues', venueId));
  if (!venueSnap.exists()) return null;
  const venue = venueSnap.data();

  const [seatsSnap, sectionsSnap, categoriesSnap] = await Promise.all([
    getDocs(query(collection(db, 'ecoasset_seats'), where('venueId', '==', venueId))),
    getDocs(query(collection(db, 'ecoasset_sections'), where('venueId', '==', venueId))),
    getDocs(query(collection(db, 'ecoasset_categories'), where('venueId', '==', venueId))),
  ]);

  return {
    id: venueId,
    venueId,
    name: venue.name,
    width: venue.layoutWidth || 1200,
    height: venue.layoutHeight || 900,
    stage: venue.stage || { x: 500, y: 40, width: 200, height: 60, label: 'SCÈNE' },
    seats: seatsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Seat)),
    sections: sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as SeatSection)),
    categories: categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as SeatCategory)),
  };
};

// ─────────────────────────────────────────────────
// REAL-TIME SUBSCRIPTION — état des sièges
// ─────────────────────────────────────────────────

/**
 * Subscribe aux mises à jour temps-réel des sièges pour un événement
 */
export const subscribeToSeats = (
  venueId: string,
  callback: (seats: Seat[]) => void
): (() => void) => {
  const q = query(collection(db, 'ecoasset_seats'), where('venueId', '==', venueId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Seat)));
  });
};

// ─────────────────────────────────────────────────
// HOLD — réservation temporaire (10 min)
// ─────────────────────────────────────────────────

/**
 * Réserve temporairement des sièges (transaction atomique)
 * Vérifie que tous sont disponibles avant de les locker
 */
export const holdSeats = async (
  seatIds: string[],
  eventId: string,
  sessionId: string,
  userId?: string
): Promise<SeatHold> => {
  if (seatIds.length === 0) throw new Error('Aucun siège sélectionné');
  if (seatIds.length > 12) throw new Error('Maximum 12 sièges par commande');

  const now = Date.now();
  const expiresAt = now + HOLD_DURATION_MS;

  await runTransaction(db, async (tx) => {
    // Vérifier chaque siège
    for (const seatId of seatIds) {
      const ref = doc(db, 'ecoasset_seats', seatId);
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error(`Siège ${seatId} introuvable`);
      const seat = snap.data() as Seat;

      if (seat.status === 'BOOKED') {
        throw new Error(`Siège ${seat.row}${seat.number} déjà vendu`);
      }
      if (seat.status === 'BLOCKED') {
        throw new Error(`Siège ${seat.row}${seat.number} indisponible`);
      }
      if (seat.status === 'RESERVED' && seat.reservedUntil && seat.reservedUntil > now) {
        // Hold actif d'une autre session
        if (seat.reservedBy !== sessionId) {
          throw new Error(`Siège ${seat.row}${seat.number} temporairement réservé`);
        }
      }

      // Locker le siège
      tx.update(ref, {
        status: 'RESERVED',
        reservedBy: sessionId,
        reservedUntil: expiresAt,
        reservedAt: serverTimestamp(),
      });
    }
  });

  const hold: SeatHold = {
    id: `hold_${sessionId}_${now}`,
    seatIds,
    userId,
    sessionId,
    eventId,
    createdAt: now,
    expiresAt,
    status: 'ACTIVE',
  };

  return hold;
};

/**
 * Libère un hold (si panier abandonné)
 */
export const releaseHold = async (
  seatIds: string[],
  sessionId: string
): Promise<void> => {
  if (seatIds.length === 0) return;

  const batch = writeBatch(db);
  for (const seatId of seatIds) {
    const ref = doc(db, 'ecoasset_seats', seatId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const seat = snap.data() as Seat;
      // Ne libérer que si c'est notre session
      if (seat.reservedBy === sessionId) {
        batch.update(ref, {
          status: 'AVAILABLE',
          reservedBy: null,
          reservedUntil: null,
          reservedAt: null,
        });
      }
    }
  }
  await batch.commit();
};

/**
 * Nettoie les holds expirés d'un lieu (à appeler périodiquement)
 */
export const cleanupExpiredHolds = async (venueId: string): Promise<number> => {
  const now = Date.now();
  const q = query(
    collection(db, 'ecoasset_seats'),
    where('venueId', '==', venueId),
    where('status', '==', 'RESERVED')
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  let cleaned = 0;

  for (const d of snap.docs) {
    const seat = d.data() as Seat;
    if (seat.reservedUntil && seat.reservedUntil < now) {
      batch.update(d.ref, {
        status: 'AVAILABLE',
        reservedBy: null,
        reservedUntil: null,
        reservedAt: null,
      });
      cleaned++;
    }
  }

  if (cleaned > 0) await batch.commit();
  return cleaned;
};

// ─────────────────────────────────────────────────
// SEAT STATUS — mise à jour admin
// ─────────────────────────────────────────────────

export const updateSeatStatus = async (
  seatId: string,
  status: SeatStatus,
  extra?: Record<string, any>
): Promise<void> => {
  await updateDoc(doc(db, 'ecoasset_seats', seatId), {
    status,
    updatedAt: serverTimestamp(),
    ...(extra || {}),
  });
};

// ─────────────────────────────────────────────────
// SEAT MAP GENERATOR (mock local si pas de Firestore)
// ─────────────────────────────────────────────────

export interface GeneratedSeat {
  id: string;
  section: string;
  row: string;
  number: number;
  x: number;
  y: number;
  status: SeatStatus;
  price: number;
  type: 'standard' | 'premium' | 'vip';
  accessible: boolean;
}

/**
 * Génère un plan de salle circulaire dynamique (fallback local)
 */
export const generateArenaLayout = (
  rows = 4,
  seatsPerRow = 20
): GeneratedSeat[] => {
  const seats: GeneratedSeat[] = [];
  const cx = 600;
  const cy = 450;

  const sections = [
    { name: 'Grandstand A', startAngle: -Math.PI * 0.7, endAngle: -Math.PI * 0.3, color: '#8b5cf6', type: 'standard' as const, price: 79 },
    { name: 'VIP Lounge', startAngle: -Math.PI * 0.3, endAngle: Math.PI * 0.3, color: '#f59e0b', type: 'vip' as const, price: 299 },
    { name: 'Grandstand B', startAngle: Math.PI * 0.3, endAngle: Math.PI * 0.7, color: '#3b82f6', type: 'standard' as const, price: 79 },
    { name: 'Premium Ring', startAngle: Math.PI * 0.7, endAngle: Math.PI * 1.3, color: '#10b981', type: 'premium' as const, price: 149 },
  ];

  sections.forEach((section) => {
    for (let r = 0; r < rows; r++) {
      const radius = 180 + r * 55;
      const totalSeats = seatsPerRow + r * 4;
      for (let s = 0; s < totalSeats; s++) {
        const angle = section.startAngle + (section.endAngle - section.startAngle) * (s / totalSeats);
        const roll = Math.random();
        seats.push({
          id: `${section.name.replace(/\s/g, '_')}_R${r + 1}_S${s + 1}`,
          section: section.name,
          row: String.fromCharCode(65 + r),
          number: s + 1,
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          status: roll < 0.3 ? 'BOOKED' : roll < 0.35 ? 'BLOCKED' : 'AVAILABLE',
          price: section.price,
          type: section.type,
          accessible: s === 0 && r === 0,
        });
      }
    }
  });

  return seats;
};
