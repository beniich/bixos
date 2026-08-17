/**
 * analyticsService.ts
 * Calcul des stats de billetterie à partir de la collection Firestore `tickets`.
 * Fournit également une souscription temps réel aux dernières activités check-in.
 */

import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import type { TicketData } from '../types/ticket';

// ============================================
// TYPES
// ============================================

export interface TicketStats {
  total: number;
  valid: number;
  used: number;
  cancelled: number;
  attendanceRate: number;   // used / total (%)
  revenue: number;          // sum pricing.total
  avgTicketPrice: number;
  byTier: Record<string, { count: number; revenue: number }>;
  bySection: Record<string, { count: number; used: number }>;
  byGate: Record<string, number>;
  timelineByDay: { date: string; sold: number; checkedIn: number }[];
}

export interface FinanceStats {
  revenueTotal: number;
  feesTotal: number;
  netRevenue: number;
  avgCart: number;
  transactionsCount: number;
  refundsTotal: number;
  revenueByDay: { date: string; amount: number }[];
  revenueByTier: Record<string, number>;
  recentTransactions: {
    bookingId: string;
    customerName: string;
    date: number;
    amount: number;
    status: 'COMPLETED' | 'REFUNDED' | 'PENDING';
    itemsCount: number;
  }[];
}

export interface CheckInActivity {
  ticketId: string;
  reference: string;
  holderName: string;
  tier: string;
  seat: string;
  gate: string;
  scannedAt: number;
  status: 'USED' | 'CANCELLED' | 'VALID' | 'RESERVED';
}

// ============================================
// HELPER
// ============================================

const isFirestoreAvailable = (): boolean => !!(db && (db as any).app);

const groupBy = <T>(arr: T[], key: (item: T) => string): Record<string, T[]> =>
  arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);

const dateKey = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ============================================
// COMPUTE STATS FROM TICKET ARRAY
// ============================================

export const computeStats = (tickets: TicketData[]): TicketStats => {
  const total = tickets.length;
  const valid = tickets.filter(t => t.status === 'VALID').length;
  const used = tickets.filter(t => t.status === 'USED').length;
  const cancelled = tickets.filter(t => t.status === 'CANCELLED').length;
  const attendanceRate = total > 0 ? Math.round((used / total) * 100) : 0;

  const revenue = tickets.reduce((sum, t) => sum + (t.pricing?.total ?? 0), 0);
  const avgTicketPrice = total > 0 ? Math.round((revenue / total) * 100) / 100 : 0;

  // By tier
  const byTierRaw = groupBy(tickets, t => t.tier ?? 'UNKNOWN');
  const byTier: TicketStats['byTier'] = {};
  for (const [tier, list] of Object.entries(byTierRaw)) {
    byTier[tier] = {
      count: list.length,
      revenue: list.reduce((s, t) => s + (t.pricing?.total ?? 0), 0),
    };
  }

  // By section
  const bySectionRaw = groupBy(tickets, t => t.seat?.section ?? 'N/A');
  const bySection: TicketStats['bySection'] = {};
  for (const [section, list] of Object.entries(bySectionRaw)) {
    bySection[section] = {
      count: list.length,
      used: list.filter(t => t.status === 'USED').length,
    };
  }

  // By gate
  const byGateRaw = groupBy(tickets, t => t.gate ?? 'N/A');
  const byGate: TicketStats['byGate'] = {};
  for (const [gate, list] of Object.entries(byGateRaw)) {
    byGate[gate] = list.length;
  }

  // Timeline: group by issuedAt day
  const soldByDay = groupBy(tickets, t => dateKey(t.issuedAt));
  const usedByDay = groupBy(
    tickets.filter(t => t.status === 'USED'),
    t => dateKey(t.issuedAt)
  );
  const allDays = [...new Set([...Object.keys(soldByDay), ...Object.keys(usedByDay)])].sort();
  const timelineByDay = allDays.map(date => ({
    date,
    sold: soldByDay[date]?.length ?? 0,
    checkedIn: usedByDay[date]?.length ?? 0,
  }));

  return {
    total, valid, used, cancelled,
    attendanceRate, revenue, avgTicketPrice,
    byTier, bySection, byGate, timelineByDay,
  };
};

// ============================================
// COMPUTE FINANCE STATS
// ============================================

export const computeFinanceStats = (tickets: TicketData[]): FinanceStats => {
  // We simulate bookings by grouping tickets by bookingId (or using timestamp/user if bookingId is missing)
  const bookingsRaw = groupBy(tickets, t => t.bookingId || t.issuedAt.toString());
  
  let revenueTotal = 0;
  let feesTotal = 0;
  let refundsTotal = 0; // Simulated
  const revenueByTier: Record<string, number> = {};
  const revenueByDayRaw = groupBy(tickets, t => dateKey(t.issuedAt));
  const revenueByDay: { date: string; amount: number }[] = [];

  for (const t of tickets) {
    const total = t.pricing?.total ?? 0;
    const fees = t.pricing?.fees ?? 0;
    
    if (t.status === 'CANCELLED') {
      refundsTotal += total;
    } else {
      revenueTotal += total;
      feesTotal += fees;
      
      const tier = t.tier ?? 'UNKNOWN';
      revenueByTier[tier] = (revenueByTier[tier] || 0) + total;
    }
  }

  for (const [date, list] of Object.entries(revenueByDayRaw)) {
    const amount = list.reduce((s, t) => s + (t.status !== 'CANCELLED' ? (t.pricing?.total ?? 0) : 0), 0);
    revenueByDay.push({ date, amount });
  }

  const transactionsCount = Object.keys(bookingsRaw).length;
  const netRevenue = revenueTotal - feesTotal;
  const avgCart = transactionsCount > 0 ? revenueTotal / transactionsCount : 0;

  const recentTransactions = Object.entries(bookingsRaw)
    .sort((a, b) => b[1][0].issuedAt - a[1][0].issuedAt)
    .slice(0, 20)
    .map(([bookingId, tix]) => {
      const amount = tix.reduce((s, t) => s + (t.pricing?.total ?? 0), 0);
      const isRefunded = tix.every(t => t.status === 'CANCELLED');
      const status: 'COMPLETED' | 'REFUNDED' | 'PENDING' = isRefunded ? 'REFUNDED' : 'COMPLETED';
      return {
        bookingId,
        customerName: tix[0]?.holder?.fullName || 'Client Inconnu',
        date: tix[0]?.issuedAt || Date.now(),
        amount,
        status,
        itemsCount: tix.length
      };
    });

  return {
    revenueTotal,
    feesTotal,
    netRevenue,
    avgCart,
    transactionsCount,
    refundsTotal,
    revenueByDay: revenueByDay.sort((a, b) => a.date.localeCompare(b.date)),
    revenueByTier,
    recentTransactions,
  };
};

// ============================================
// ONE-SHOT FETCH STATS
// ============================================

export const getTicketStats = async (eventId: string): Promise<TicketStats> => {
  if (!isFirestoreAvailable()) return computeStats([]);

  try {
    const q = query(
      collection(db, 'tickets'),
      where('eventId', '==', eventId)
    );
    const snapshot = await getDocs(q);
    const tickets: TicketData[] = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as TicketData));
    return computeStats(tickets);
  } catch (err: any) {
    console.warn('[analyticsService] getTicketStats error:', err?.message);
    return computeStats([]);
  }
};

// ============================================
// REALTIME SUBSCRIPTION (stats live)
// ============================================

export const subscribeToTicketStats = (
  eventId: string,
  onUpdate: (stats: TicketStats) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!isFirestoreAvailable()) {
    console.warn('[analyticsService] Firestore not configured.');
    return () => {};
  }

  const q = query(collection(db, 'tickets'), where('eventId', '==', eventId));

  return onSnapshot(
    q,
    snapshot => {
      const tickets: TicketData[] = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as TicketData));
      onUpdate(computeStats(tickets));
    },
    err => {
      console.warn('[analyticsService] subscription error:', err?.message);
      if (onError) onError(err);
    }
  );
};

// ============================================
// REALTIME CHECK-IN ACTIVITY FEED
// ============================================

export const subscribeToCheckInActivity = (
  eventId: string,
  onUpdate: (activity: CheckInActivity[]) => void,
  maxItems = 20
): Unsubscribe => {
  if (!isFirestoreAvailable()) return () => {};

  const q = query(
    collection(db, 'tickets'),
    where('eventId', '==', eventId),
    where('status', '==', 'USED'),
    orderBy('issuedAt', 'desc'),
    limit(maxItems)
  );

  return onSnapshot(q, snapshot => {
    const activity: CheckInActivity[] = snapshot.docs.map(d => {
      const t = { ...d.data(), id: d.id } as TicketData;
      return {
        ticketId: t.id,
        reference: t.reference,
        holderName: t.holder?.fullName ?? 'Inconnu',
        tier: t.tier ?? 'STANDARD',
        seat: t.seat ? `${t.seat.section} ${t.seat.row}${t.seat.number}` : '—',
        gate: t.gate ?? '—',
        scannedAt: t.issuedAt,
        status: t.status,
      };
    });
    onUpdate(activity);
  });
};
