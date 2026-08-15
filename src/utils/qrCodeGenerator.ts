/**
 * QR Code Generator — Utilitaires de génération de QR codes
 * Utilise l'API canvas natif du navigateur pour générer des QR codes simples.
 * Pour une vraie génération, intégrez la librairie 'qrcode' ou 'qrcode.react'.
 */

export interface QRCodeOptions {
  size?: number
  foregroundColor?: string
  backgroundColor?: string
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
}

/**
 * Génère l'URL d'un QR code via l'API Google Charts (no-dep, in-browser)
 */
export function generateQRCodeUrl(
  data: string,
  options: QRCodeOptions = {}
): string {
  const { size = 200, foregroundColor = '000000', backgroundColor = 'FFFFFF' } = options
  const encoded = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=${foregroundColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}`
}

/**
 * Génère le payload QR code pour un billet
 */
export function buildTicketQRPayload(params: {
  ticketId: string
  reference: string
  eventId: string
  signature: string
}): string {
  return JSON.stringify({
    v: 1,
    t: params.ticketId,
    r: params.reference,
    e: params.eventId,
    s: params.signature,
    ts: Date.now()
  })
}

/**
 * Decode un payload QR code
 */
export function decodeTicketQRPayload(payload: string): {
  version: number
  ticketId: string
  reference: string
  eventId: string
  signature: string
  timestamp: number
} | null {
  try {
    const data = JSON.parse(payload)
    return {
      version: data.v,
      ticketId: data.t,
      reference: data.r,
      eventId: data.e,
      signature: data.s,
      timestamp: data.ts
    }
  } catch {
    return null
  }
}

/**
 * Génère un code de référence unique pour un billet
 */
export function generateTicketReference(params: {
  eventId: string
  tier: string
  index: number
}): string {
  const prefix = params.tier.substring(0, 3).toUpperCase()
  const eventHash = params.eventId.substring(0, 4).toUpperCase()
  const num = String(params.index).padStart(4, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${eventHash}-${num}-${random}`
}

/**
 * Valide la signature d'un billet
 */
export function validateTicketSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Signature simple HMAC-like (dans un vrai projet, utilisez crypto.subtle)
  const combined = `${payload}:${secret}`
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const expectedSig = Math.abs(hash).toString(16).toUpperCase()
  return signature.includes(expectedSig.substring(0, 8))
}
