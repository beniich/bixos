/**
 * bookingService.ts
 * Gestion complète des réservations EcoAsset Ticketing
 * Architecture: Firestore + transactions atomiques + hold sièges (10min)
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Booking,
  BookingItem,
  BookingStatus,
  IssuedTicket,
  PromoCode,
} from '../types/seat';

const FEE_PERCENTAGE = 0.025; // 2.5%
const FEE_FIXED = 0.35;       // €0.35 fixe

// ─────────────────────────────────────────────────
// BOOKING — CRÉATION
// ─────────────────────────────────────────────────

export interface BookingInput {
  eventId: string;
  userId?: string;
  items: BookingItem[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  seatIds?: string[];
  promoCode?: string;
  paymentMethod: 'CARD' | 'PAYPAL' | 'APPLE_PAY' | 'BANK_TRANSFER';
}

/**
 * Crée une réservation en statut PENDING + réserve les sièges atomiquement
 */
export const createBooking = async (input: BookingInput): Promise<Booking> => {
  // 1. Charger l'événement
  const eventRef = doc(db, 'ecoasset_events', input.eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) throw new Error('Événement introuvable');
  const event = eventSnap.data();
  if (event.status !== 'PUBLISHED') throw new Error('Événement non ouvert à la vente');

  // 2. Vérifier la dispo des tickets
  await checkTicketAvailability(input.items);

  // 3. Calcul montants
  const subtotal = input.items.reduce((s, i) => s + i.subtotal, 0);
  const discount = await applyPromoCode(input.promoCode, subtotal, input.eventId);
  const fees = Math.round(((subtotal - discount) * FEE_PERCENTAGE + FEE_FIXED) * 100) / 100;
  const total = Math.round((subtotal - discount + fees) * 100) / 100;

  // 4. Créer la réservation + réserver atomiquement les sièges
  const reference = generateReference();
  let bookingId = '';

  await runTransaction(db, async (tx) => {
    // Vérification + réservation des billets (stock)
    for (const item of input.items) {
      if (item.quantity <= 0) continue;
      const ticketRef = doc(db, 'ecoasset_tickets', item.ticketId);
      const ticketDoc = await tx.get(ticketRef);
      if (!ticketDoc.exists()) throw new Error(`Billet "${item.ticketName}" introuvable`);
      const t = ticketDoc.data();
      const available = t.quantity === -1 ? Infinity : t.quantity - (t.quantity_sold || 0);
      if (available < item.quantity) {
        throw new Error(`Stock insuffisant: "${item.ticketName}" (${available} restant)`);
      }
      tx.update(ticketRef, {
        quantity_sold: (t.quantity_sold || 0) + item.quantity,
        updatedAt: serverTimestamp(),
      });
    }

    // Réservation des sièges
    for (const seatId of input.seatIds || []) {
      const seatRef = doc(db, 'ecoasset_seats', seatId);
      const seatDoc = await tx.get(seatRef);
      if (!seatDoc.exists()) throw new Error(`Siège ${seatId} introuvable`);
      const s = seatDoc.data();
      if (s.status === 'BOOKED') throw new Error(`Siège ${s.row}${s.number} déjà vendu`);
      if (s.status === 'BLOCKED') throw new Error(`Siège ${s.row}${s.number} bloqué`);
      tx.update(seatRef, {
        status: 'RESERVED',
        reservedAt: serverTimestamp(),
        reservedUntil: Date.now() + 15 * 60 * 1000, // 15min
      });
    }
  });

  // 5. Persister la réservation
  const bookingData = {
    reference,
    eventId: input.eventId,
    eventTitle: event.title || '',
    eventDate: event.startDate || '',
    venueName: event.venueName || '',
    userId: input.userId || null,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    customerPhone: input.customerPhone || null,
    items: input.items,
    seatIds: input.seatIds || [],
    subtotal,
    discount,
    fees,
    total,
    currency: 'EUR',
    status: 'PENDING' as BookingStatus,
    paymentStatus: 'PENDING',
    paymentMethod: input.paymentMethod,
    promoCode: input.promoCode || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'ecoasset_bookings'), bookingData);
  bookingId = docRef.id;

  return {
    id: bookingId,
    reference,
    eventId: input.eventId,
    eventTitle: event.title || '',
    eventDate: event.startDate || '',
    venueName: event.venueName || '',
    userId: input.userId,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    items: input.items,
    seatIds: input.seatIds || [],
    subtotal,
    discount,
    fees,
    total,
    currency: 'EUR',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    promoCode: input.promoCode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

// ─────────────────────────────────────────────────
// BOOKING — CONFIRMATION (après paiement Stripe)
// ─────────────────────────────────────────────────

export const confirmBooking = async (
  bookingId: string,
  paymentIntentId: string
): Promise<Booking> => {
  const ref = doc(db, 'ecoasset_bookings', bookingId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Réservation introuvable');
  const booking = snap.data() as Booking;
  if (booking.status === 'CONFIRMED') return { ...booking, id: bookingId };

  const batch = writeBatch(db);

  // Mettre à jour le statut de la réservation
  batch.update(ref, {
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentIntentId,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Confirmer les sièges comme BOOKED
  for (const seatId of booking.seatIds || []) {
    const seatRef = doc(db, 'ecoasset_seats', seatId);
    batch.update(seatRef, {
      status: 'BOOKED',
      bookedAt: serverTimestamp(),
      bookedBy: bookingId,
    });
  }

  await batch.commit();

  return { ...booking, id: bookingId, status: 'CONFIRMED', paymentStatus: 'PAID' };
};

// ─────────────────────────────────────────────────
// BOOKING — ANNULATION
// ─────────────────────────────────────────────────

export const cancelBooking = async (bookingId: string, reason?: string): Promise<void> => {
  const ref = doc(db, 'ecoasset_bookings', bookingId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Réservation introuvable');
  const booking = snap.data() as Booking;
  if (booking.status === 'CANCELLED') return;

  await runTransaction(db, async (tx) => {
    // Libérer le stock de billets
    for (const item of booking.items || []) {
      const ticketRef = doc(db, 'ecoasset_tickets', item.ticketId);
      const tDoc = await tx.get(ticketRef);
      if (tDoc.exists()) {
        const sold = tDoc.data().quantity_sold || 0;
        tx.update(ticketRef, {
          quantity_sold: Math.max(0, sold - item.quantity),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Libérer les sièges
    for (const seatId of booking.seatIds || []) {
      const seatRef = doc(db, 'ecoasset_seats', seatId);
      tx.update(seatRef, {
        status: 'AVAILABLE',
        reservedAt: null,
        reservedUntil: null,
        bookedAt: null,
        bookedBy: null,
      });
    }

    // Annuler la réservation
    tx.update(ref, {
      status: 'CANCELLED',
      cancelledAt: serverTimestamp(),
      cancelReason: reason || null,
      updatedAt: serverTimestamp(),
    });
  });
};

// ─────────────────────────────────────────────────
// CHECK-IN / VALIDATION QR
// ─────────────────────────────────────────────────

export const validateCheckIn = async (
  ticketId: string,
  gate: string
): Promise<{ success: boolean; message: string; ticket?: IssuedTicket }> => {
  const ref = doc(db, 'ecoasset_tickets_issued', ticketId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { success: false, message: 'Billet introuvable' };

  const ticket = { id: snap.id, ...snap.data() } as IssuedTicket;

  if (ticket.status === 'USED') {
    return { success: false, message: 'Billet déjà scanné', ticket };
  }
  if (ticket.status === 'CANCELLED') {
    return { success: false, message: 'Billet annulé', ticket };
  }

  await updateDoc(ref, {
    status: 'USED',
    usedAt: Date.now(),
    checkInGate: gate,
  });

  return {
    success: true,
    message: `Accès validé — ${ticket.tierName}`,
    ticket: { ...ticket, status: 'USED', usedAt: Date.now() },
  };
};

// ─────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  const q = query(
    collection(db, 'ecoasset_bookings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
};

export const subscribeToEventBookings = (
  eventId: string,
  callback: (bookings: Booking[]) => void
) => {
  const q = query(
    collection(db, 'ecoasset_bookings'),
    where('eventId', '==', eventId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
  });
};

// ─────────────────────────────────────────────────
// HELPERS INTERNES
// ─────────────────────────────────────────────────

const checkTicketAvailability = async (items: BookingItem[]): Promise<void> => {
  for (const item of items) {
    if (item.quantity <= 0) continue;
    const snap = await getDoc(doc(db, 'ecoasset_tickets', item.ticketId));
    if (!snap.exists()) throw new Error(`Billet "${item.ticketName}" introuvable`);
    const t = snap.data();
    if (t.quantity !== -1) {
      const available = t.quantity - (t.quantity_sold || 0);
      if (available < item.quantity) {
        throw new Error(`Stock insuffisant: "${item.ticketName}" (${available} restant)`);
      }
    }
  }
};

const applyPromoCode = async (
  code: string | undefined,
  subtotal: number,
  eventId: string
): Promise<number> => {
  if (!code) return 0;
  const snap = await getDoc(doc(db, 'ecoasset_promo_codes', code.toUpperCase()));
  if (!snap.exists()) return 0;

  const promo = snap.data() as PromoCode;
  const now = Date.now();

  if (!promo.active) return 0;
  if (promo.validFrom && now < promo.validFrom) return 0;
  if (promo.validUntil && now > promo.validUntil) return 0;
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return 0;
  if (promo.applicableEvents?.length && !promo.applicableEvents.includes(eventId)) return 0;
  if (promo.minPurchase && subtotal < promo.minPurchase) return 0;

  if (promo.type === 'PERCENTAGE') {
    return Math.round(subtotal * (promo.value / 100) * 100) / 100;
  }
  return Math.min(promo.value, subtotal);
};

const generateReference = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'ECO-';
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
};
