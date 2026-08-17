import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import type {
  TicketData,
  TicketDesign,
  PrintConfig,
  PrintLayout,
  PaperSize
} from '../types/ticket'

/**
 * Génère un PDF à partir d'une config d'impression
 */
export const generatePDF = async (
  config: PrintConfig,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const { design, tickets } = config

  // Initialiser jsPDF
  const doc = new jsPDF({
    orientation: design.orientation,
    unit: 'mm',
    format: normalizePaperSize(design.paperSize),
    compress: true
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Dimensions d'un billet
  const layoutInfo = getLayoutInfo(design.layout)
  const ticketsPerPage = layoutInfo.perPage
  const cols = layoutInfo.cols
  const rows = layoutInfo.rows

  const availableWidth = pageWidth - design.marginMm * 2 - design.spacingMm * (cols - 1)
  const availableHeight = pageHeight - design.marginMm * 2 - design.spacingMm * (rows - 1)
  const cellWidth = availableWidth / cols
  const cellHeight = availableHeight / rows

  // Pré-générer tous les QR codes (async)
  const qrCache = new Map<string, string>()
  const ticketsWithQR = await Promise.all(
    tickets.map(async (ticket) => {
      if (!qrCache.has(ticket.qrPayload)) {
        try {
          const qr = await QRCode.toDataURL(ticket.qrPayload, {
            errorCorrectionLevel: 'H',
            margin: 0,
            width: 200,
            color: { dark: '#000000', light: '#ffffff' }
          })
          qrCache.set(ticket.qrPayload, qr)
        } catch (e) {
          console.error('Erreur QR:', e)
          qrCache.set(ticket.qrPayload, '')
        }
      }
      return ticket
    })
  )

  // Générer les pages
  const totalPages = Math.max(1, Math.ceil(ticketsWithQR.length / ticketsPerPage))
  let currentPage = 0

  for (let i = 0; i < ticketsWithQR.length; i += ticketsPerPage) {
    currentPage++
    onProgress?.(Math.round((currentPage / totalPages) * 100))

    if (i > 0) doc.addPage()

    const pageTickets = ticketsWithQR.slice(i, i + ticketsPerPage)

    for (let j = 0; j < pageTickets.length; j++) {
      const ticket = pageTickets[j]
      const col = j % cols
      const row = Math.floor(j / cols)

      const x = design.marginMm + col * (cellWidth + design.spacingMm)
      const y = design.marginMm + row * (cellHeight + design.spacingMm)

      await renderTicketToPDF(
        doc,
        ticket,
        design,
        x,
        y,
        cellWidth,
        cellHeight,
        qrCache.get(ticket.qrPayload) || ''
      )
    }

    // Footer de page
    renderPageFooter(doc, design, currentPage, totalPages)
  }

  // Retourner le blob
  return doc.output('blob')
}

// ============================================
// RENDU D'UN BILLET
// ============================================
const renderTicketToPDF = async (
  doc: jsPDF,
  ticket: TicketData,
  design: TicketDesign,
  x: number,
  y: number,
  width: number,
  height: number,
  qrDataUrl: string
): Promise<void> => {
  const tierColors: Record<string, [number, number, number]> = {
    STANDARD: [0, 229, 255],
    PREMIUM: [255, 0, 170],
    VIP: [255, 184, 0],
    GENERAL: [139, 146, 168]
  }
  const tierColor = tierColors[ticket.tier] || [0, 229, 255]

  // Fond
  const bgColor = hexToRgb(design.backgroundColor)
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
  doc.roundedRect(x, y, width, height, 2, 2, 'F')

  // Bordure tier
  doc.setDrawColor(tierColor[0], tierColor[1], tierColor[2])
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, width, height, 2, 2, 'S')

  // Bandeau supérieur (tier)
  doc.setFillColor(tierColor[0], tierColor[1], tierColor[2])
  doc.roundedRect(x, y, width, 7, 2, 2, 'F')
  // Carré bas du bandeau (pour l'angle droit)
  doc.rect(x, y + 5, width, 2, 'F')

  // Texte tier
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(ticket.tier, x + 2, y + 5)

  // Logo (si activé)
  if (design.showLogo) {
    doc.setFontSize(6)
    doc.text('ECOASSET', x + width - 2, y + 5, { align: 'right' })
  }

  // Titre événement
  const textColor = hexToRgb(design.textColor)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  const titleLines = doc.splitTextToSize(ticket.event.title, width - 4)
  const truncatedLines = titleLines.slice(0, 2)
  doc.text(truncatedLines, x + 2, y + 12)

  let currentY = y + 12 + (truncatedLines.length * 4) + 1

  // Date
  if (design.fields.eventDate) {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    const dateStr = new Date(ticket.event.startDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    doc.text(`📅 ${dateStr}`, x + 2, currentY)
    currentY += 3.5
  }

  // Heure
  if (design.fields.eventTime) {
    doc.setFontSize(7)
    const timeStr = new Date(ticket.event.startDate).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`🕐 ${timeStr}`, x + 2, currentY)
    currentY += 3.5
  }

  // Lieu
  if (design.fields.venueName) {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    const venueName = doc.splitTextToSize(`📍 ${ticket.venue.name}`, width - 4)[0]
    doc.text(venueName, x + 2, currentY)
    currentY += 3.5
  }

  if (design.fields.venueAddress && height > 50) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(textColor[0], textColor[1], textColor[2], 0.6)
    const addr = `${ticket.venue.address}, ${ticket.venue.city}`
    const addrLines = doc.splitTextToSize(addr, width - 4)
    if (addrLines.length > 0) {
      doc.text(addrLines[0], x + 2, currentY)
      currentY += 3
    }
  }

  // QR Code
  if (design.showQrCode && qrDataUrl) {
    try {
      const qrSize = Math.min(width * 0.35, height * 0.35, 28)
      doc.addImage(
        qrDataUrl,
        'PNG',
        x + width - qrSize - 2,
        y + height - qrSize - 6,
        qrSize,
        qrSize
      )
    } catch (e) {
      console.error('Erreur insertion QR:', e)
    }
  }

  // Siège (bas)
  if (design.fields.section || design.fields.seatRow || design.fields.seatNumber) {
    doc.setFontSize(7)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFont('helvetica', 'normal')
    doc.text('Siège', x + 2, y + height - 14)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(tierColor[0], tierColor[1], tierColor[2])
    const seatStr = `${ticket.seat.section} ${ticket.seat.row}${ticket.seat.number}`
    doc.text(seatStr, x + 2, y + height - 9)
  }

  // Prix
  if (design.fields.price) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(tierColor[0], tierColor[1], tierColor[2])
    const priceStr = `${ticket.pricing.total.toFixed(2)} ${ticket.pricing.currency}`
    doc.text(priceStr, x + width - 2, y + height - 3, { align: 'right' })
  }

  // Référence
  if (design.fields.reference) {
    doc.setFontSize(5)
    doc.setFont('courier', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(ticket.reference, x + 2, y + height - 1)
  }

  // Watermark
  if (design.watermark) {
    doc.setTextColor(220, 220, 220)
    doc.setFontSize(36)
    doc.setFont('helvetica', 'bold')
    doc.text(design.watermark, x + width / 2, y + height / 2, {
      align: 'center',
      angle: 30
    })
  }

  // Détenteur (verso ou bas)
  if (design.fields.ticketHolder) {
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text(ticket.holder.fullName, x + 2, y + height - 6)
  }
}

// ============================================
// FOOTER DE PAGE
// ============================================
const renderPageFooter = (
  doc: jsPDF,
  design: TicketDesign,
  pageNum: number,
  totalPages: number
): void => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text(
    `ECOASSET · Billets officiels · Page ${pageNum} / ${totalPages}`,
    pageWidth / 2,
    pageHeight - 3,
    { align: 'center' }
  )
}

// ============================================
// UTILITAIRES
// ============================================
const normalizePaperSize = (size: PaperSize): string | [number, number] => {
  const map: Record<PaperSize, string | [number, number]> = {
    A4: 'a4',
    A5: 'a5',
    LETTER: 'letter',
    THERMAL_80MM: [80, 297],
    THERMAL_58MM: [58, 297]
  }
  return map[size]
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [10, 14, 26]
}

interface LayoutInfo {
  perPage: number
  cols: number
  rows: number
}

const getLayoutInfo = (layout: PrintLayout): LayoutInfo => {
  const map: Record<PrintLayout, LayoutInfo> = {
    SINGLE:      { perPage: 1,  cols: 1, rows: 1 },
    TWO_COLUMN:  { perPage: 2,  cols: 2, rows: 1 },
    FOUR_GRID:   { perPage: 4,  cols: 2, rows: 2 },
    BADGE_SHEET: { perPage: 10, cols: 2, rows: 5 },
    AVERY_5160:  { perPage: 30, cols: 3, rows: 10 },
    AVERY_5163:  { perPage: 20, cols: 2, rows: 10 }
  }
  return map[layout] || map.TWO_COLUMN
}

// Export pour réutilisation
export { normalizePaperSize, hexToRgb, getLayoutInfo }
