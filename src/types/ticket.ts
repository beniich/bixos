export type TicketFormat = 'STANDARD' | 'COMPACT' | 'PREMIUM' | 'BADGE' | 'E_TICKET'
export type PaperSize = 'A4' | 'A5' | 'LETTER' | 'THERMAL_80MM' | 'THERMAL_58MM'
export type PrintLayout = 'SINGLE' | 'TWO_COLUMN' | 'FOUR_GRID' | 'BADGE_SHEET' | 'AVERY_5160' | 'AVERY_5163'

export interface TicketDesign {
  format: TicketFormat
  paperSize: PaperSize
  layout: PrintLayout
  orientation: 'portrait' | 'landscape'
  marginMm: number
  spacingMm: number

  // Branding
  showLogo: boolean
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string

  // Contenu
  showQrCode: boolean
  qrSize: number
  showBarcode: boolean
  showSeatMap: boolean
  showEventLogo: boolean
  showOrganizer: boolean
  showTerms: boolean
  showRefundPolicy: boolean
  customMessage?: string

  fields: {
    eventTitle: boolean
    eventDate: boolean
    eventTime: boolean
    venueName: boolean
    venueAddress: boolean
    seatRow: boolean
    seatNumber: boolean
    section: boolean
    category: boolean
    ticketHolder: boolean
    ticketType: boolean
    price: boolean
    reference: boolean
    gate: boolean
  }

  // Sécurité
  watermark?: string
  holographicEffect: boolean
  antiCopyCode: boolean
}

export interface TicketData {
  id: string
  reference: string
  ticketConfigId: string
  ticketName: string
  tier: 'STANDARD' | 'PREMIUM' | 'VIP' | 'GENERAL'
  qrPayload: string
  qrCodeUrl: string
  signature: string
  status: 'VALID' | 'USED' | 'CANCELLED' | 'RESERVED'

  eventId: string
  event: {
    id: string
    title: string
    subtitle?: string
    startDate: string
    endDate: string
    coverImage?: string
    logo?: string
    category: string
    type: string
    organizer: { name: string; logo?: string }
  }

  venue: {
    id: string
    name: string
    address: string
    city: string
    gates: Array<{ id: string; name: string }>
  }

  seat: {
    id: string
    section: string
    row: string
    number: number
    category: string
    color: string
    accessible?: boolean
  }

  holder: {
    firstName: string
    lastName: string
    fullName: string
    email: string
    phone?: string
  }

  pricing: {
    unitPrice: number
    fees: number
    total: number
    currency: string
  }

  issuedAt: number
  validUntil?: number
  gate?: string
  entryTime?: string
  customData?: Record<string, any>
}

export interface PrintConfig {
  design: TicketDesign
  tickets: TicketData[]
  copies: number
  grouping: 'INDIVIDUAL' | 'BOOKING' | 'CATEGORY' | 'SECTION'
  sortBy: 'REFERENCE' | 'NAME' | 'SECTION' | 'ROW' | 'TIER'
  autoOpenPrint: boolean
  includeBackupPdf: boolean
  pdfFilename: string
}
