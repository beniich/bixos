/**
 * qrCodeService.ts
 * Génération et validation de QR codes signés HMAC-SHA256
 * Sécurité : chaque billet a une signature cryptographique unique
 */
import type { IssuedTicket, Booking } from '../types/seat';

const QR_SECRET = import.meta.env.VITE_QR_SECRET || 'bizos_qr_dev_secret_2026';
const QR_EXPIRY_HOURS = 24; // QR valide 24h après l'événement

// ─────────────────────────────────────────────────
// SIGNATURE HMAC-SHA256
// ─────────────────────────────────────────────────

const hmacSign = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(QR_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const hmacVerify = async (data: string, signature: string): Promise<boolean> => {
  const expected = await hmacSign(data);
  return expected === signature;
};

// ─────────────────────────────────────────────────
// PAYLOAD QR
// ─────────────────────────────────────────────────

export interface QRPayload {
  ticketId: string;
  bookingId: string;
  eventId: string;
  seatLabel?: string;
  tierName: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

// ─────────────────────────────────────────────────
// GÉNÉRATION
// ─────────────────────────────────────────────────

/**
 * Génère le payload signé pour un billet
 */
export const generateQRPayload = async (
  ticketId: string,
  bookingId: string,
  eventId: string,
  tierName: string,
  seatLabel?: string
): Promise<string> => {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + QR_EXPIRY_HOURS * 3600 * 1000;

  // Données à signer
  const signData = `${ticketId}:${bookingId}:${eventId}:${issuedAt}`;
  const signature = await hmacSign(signData);

  const payload: QRPayload = {
    ticketId,
    bookingId,
    eventId,
    seatLabel,
    tierName,
    issuedAt,
    expiresAt,
    signature,
  };

  return btoa(JSON.stringify(payload));
};

/**
 * Génère les billets émis pour une réservation confirmée
 */
export const generateIssuedTickets = async (
  booking: Booking
): Promise<IssuedTicket[]> => {
  const tickets: IssuedTicket[] = [];

  for (const item of booking.items) {
    for (let q = 0; q < item.quantity; q++) {
      const ticketId = `TKT-${booking.reference}-${item.ticketId}-${q + 1}`;
      const seatId = booking.seatIds[tickets.length] || undefined;
      const seatLabel = seatId ? `Siège ${seatId}` : undefined;

      const qrPayload = await generateQRPayload(
        ticketId,
        booking.id,
        booking.eventId,
        item.tierName,
        seatLabel
      );

      // Génération du QR code image (via qrcode.js si disponible)
      let qrDataUrl: string | undefined;
      try {
        const QRCode = await import('qrcode');
        qrDataUrl = await QRCode.toDataURL(qrPayload, {
          width: 300,
          margin: 2,
          color: { dark: '#1a0a2e', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });
      } catch {
        // qrcode not installed → QR string only
      }

      tickets.push({
        id: ticketId,
        bookingId: booking.id,
        eventId: booking.eventId,
        userId: booking.userId,
        seatId,
        seatLabel,
        tierName: item.tierName,
        qrPayload,
        qrDataUrl,
        status: 'VALID',
        createdAt: Date.now(),
      });
    }
  }

  return tickets;
};

// ─────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────

export interface QRValidationResult {
  valid: boolean;
  reason?: string;
  payload?: QRPayload;
}

/**
 * Valide un QR payload (decode + vérifie signature + TTL)
 */
export const validateQRPayload = async (raw: string): Promise<QRValidationResult> => {
  try {
    const payload: QRPayload = JSON.parse(atob(raw));
    const now = Date.now();

    // 1. Vérifier expiration
    if (payload.expiresAt && now > payload.expiresAt) {
      return { valid: false, reason: 'QR code expiré', payload };
    }

    // 2. Vérifier signature
    const signData = `${payload.ticketId}:${payload.bookingId}:${payload.eventId}:${payload.issuedAt}`;
    const isValid = await hmacVerify(signData, payload.signature);
    if (!isValid) {
      return { valid: false, reason: 'Signature invalide — billet falsifié', payload };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'QR code illisible ou corrompu' };
  }
};

export const verifyTicketData = validateQRPayload;

// ─────────────────────────────────────────────────
// AFFICHAGE QR — helper UI
// ─────────────────────────────────────────────────

/**
 * Génère une URL Data du QR code pour affichage dans <img>
 * Fallback : retourne undefined si qrcode n'est pas installé
 */
export const getQRDataUrl = async (
  payload: string,
  options?: { size?: number; dark?: string; light?: string }
): Promise<string | undefined> => {
  try {
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(payload, {
      width: options?.size || 250,
      margin: 2,
      color: {
        dark: options?.dark || '#1a0a2e',
        light: options?.light || '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch {
    return undefined;
  }
};
