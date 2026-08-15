// ===================================================
// SEAT & VENUE TYPES — BizOS EcoAsset Ticketing
// ===================================================

export type SeatStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'BLOCKED' | 'AISLE';
export type SeatCategoryType = 'STANDARD' | 'PREMIUM' | 'VIP' | 'OBSTRUCTED' | 'ACCESSIBLE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' | 'USED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

// ──────────────── SEAT ────────────────
export interface Seat {
  id: string;
  venueId: string;
  sectionId: string;
  row: string;
  number: number;
  x: number;
  y: number;
  categoryId: string;
  status: SeatStatus;
  accessible: boolean;
  viewQuality: 1 | 2 | 3 | 4 | 5;
  blockedReason?: string;
  pricing?: {
    basePrice: number;
    fees: number;
  };
  reservedUntil?: number; // timestamp TTL pour hold
  reservedBy?: string;    // sessionId du hold actif
  bookedBy?: string;      // bookingId confirmé
}

// ──────────────── SECTION ────────────────
export interface SeatSection {
  id: string;
  venueId: string;
  name: string;
  color: string;
  capacity: number;
  shape: 'RECTANGLE' | 'POLYGON' | 'CIRCLE';
  coordinates: { x: number; y: number; width: number; height: number };
  rotation?: number;
  categoryId: string;
}

// ──────────────── CATÉGORIE TARIFAIRE ────────────────
export interface SeatCategory {
  id: string;
  venueId: string;
  name: string;
  color: string;
  description?: string;
  basePrice: number;
  perks: string[];
}

// ──────────────── HOLD (réservation temporaire 10min) ────────────────
export interface SeatHold {
  id: string;
  seatIds: string[];
  userId?: string;
  sessionId: string;
  eventId: string;
  createdAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CONFIRMED' | 'RELEASED';
}

// ──────────────── VENUE LAYOUT ────────────────
export interface VenueLayout {
  id: string;
  venueId: string;
  name: string;
  width: number;
  height: number;
  stage: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  };
  sections: SeatSection[];
  seats: Seat[];
  categories: SeatCategory[];
}

// ──────────────── BOOKING ITEMS ────────────────
export interface BookingItem {
  ticketId: string;
  ticketName: string;
  tier: string;
  tierName: string; // alias used by qrCodeService
  unitPrice: number;
  quantity: number;
  subtotal: number;
  includes?: string[];
}

// ──────────────── BOOKING ────────────────
export interface Booking {
  id: string;
  reference: string;          // ECO-XXXXXXXX
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  items: BookingItem[];
  seatIds: string[];
  subtotal: number;
  discount: number;
  fees: number;
  total: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  paymentMethod?: string;
  promoCode?: string;
  qrCodes?: IssuedTicket[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
  cancelledAt?: number;
  cancelReason?: string;
}

// ──────────────── TICKET ÉMIS ────────────────
export interface IssuedTicket {
  id: string;
  bookingId: string;
  eventId: string;
  userId?: string;
  seatId?: string;
  seatLabel?: string;     // "A12 — Orchestre"
  tierName: string;
  qrPayload: string;      // base64 encodé signé HMAC
  qrDataUrl?: string;     // image PNG base64
  status: 'VALID' | 'USED' | 'CANCELLED';
  usedAt?: number;
  checkInGate?: string;
  createdAt: number;
}

// ──────────────── PROMO CODE ────────────────
export interface PromoCode {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: number;
  validUntil: number;
  applicableEvents?: string[];
  firstPurchaseOnly?: boolean;
  active: boolean;
}

// ──────────────── PAIEMENT ────────────────
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: 'EUR' | 'USD';
  method: 'CARD' | 'PAYPAL' | 'APPLE_PAY' | 'BANK_TRANSFER';
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  gatewayRef: string;
  createdAt: number;
  succeededAt?: number;
  refundedAt?: number;
  refundAmount?: number;
  refundReason?: string;
}

// ──────────────── WAITLIST ────────────────
export interface WaitlistEntry {
  id: string;
  eventId: string;
  userId: string;
  email: string;
  tierName: string;
  quantity: number;
  notifiedAt?: number;
  status: 'WAITING' | 'NOTIFIED' | 'EXPIRED' | 'CONVERTED';
  createdAt: number;
}

// ──────────────── DYNAMIC PRICING ────────────────
export interface PricingRule {
  type: 'EARLY_BIRD' | 'LAST_MINUTE' | 'DEMAND_BASED';
  trigger: {
    daysBeforeEvent?: number;
    fillRatePercent?: number;
  };
  priceModifier: {
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
  };
}

export interface DynamicPricing {
  enabled: boolean;
  rules: PricingRule[];
}
