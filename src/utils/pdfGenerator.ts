/**
 * PDF Generator — Génère un PDF à partir d'une PrintConfig
 * Utilise l'API print du navigateur via une iframe.
 * Pour une vraie génération PDF, intégrez jsPDF ou pdfmake.
 */
import type { PrintConfig } from '../types/ticket'

export type ProgressCallback = (progress: number) => void

/**
 * Génère un Blob PDF à partir d'une PrintConfig.
 * Simulation avec printable HTML → Blob.
 */
export async function generatePDF(
  config: PrintConfig,
  onProgress?: ProgressCallback
): Promise<Blob> {
  onProgress?.(10)

  const html = buildPrintHTML(config)

  onProgress?.(50)

  // Créer un Blob HTML (dans un vrai projet, ici on utiliserait jsPDF)
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' })

  onProgress?.(100)

  return blob
}

function buildPrintHTML(config: PrintConfig): string {
  const { design, tickets } = config

  const ticketCards = tickets.map(ticket => `
    <div class="ticket-card tier-${ticket.tier.toLowerCase()}">
      <div class="tier-band" style="background: ${getTierColor(ticket.tier)};">
        <span>${ticket.tier}</span>
        <span>ECOASSET</span>
      </div>
      <div class="ticket-body">
        <h2>${ticket.event.title}</h2>
        <p class="date">${new Date(ticket.event.startDate).toLocaleString('fr-FR')}</p>
        <div class="venue">📍 ${ticket.venue.name}, ${ticket.venue.city}</div>
        <div class="seat-row">
          <div class="seat-box">
            <small>Section</small>
            <strong>${ticket.seat.section}</strong>
          </div>
          <div class="seat-box">
            <small>Rangée</small>
            <strong>${ticket.seat.row}</strong>
          </div>
          <div class="seat-box highlight" style="background: ${getTierColor(ticket.tier)};">
            <small>Siège</small>
            <strong>${ticket.seat.number}</strong>
          </div>
        </div>
        <div class="footer">
          <code class="ref">${ticket.reference}</code>
          <strong class="price">${ticket.pricing.total.toFixed(2)} ${ticket.pricing.currency}</strong>
        </div>
        ${design.fields.ticketHolder ? `<div class="holder">Détenteur: <strong>${ticket.holder.fullName}</strong></div>` : ''}
        ${design.customMessage ? `<div class="message">${design.customMessage}</div>` : ''}
        ${design.showOrganizer ? `<div class="organizer">Par ${ticket.event.organizer.name}</div>` : ''}
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${config.pdfFilename}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; background: #f5f5f5; padding: ${design.marginMm}mm; }
    .page { 
      display: grid; 
      grid-template-columns: ${getGridColumns(config.design.layout)}; 
      gap: ${design.spacingMm}mm;
      background: white;
      padding: ${design.marginMm}mm;
      max-width: ${getPaperWidth(design.paperSize)}mm;
      margin: 0 auto;
    }
    .ticket-card { border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .tier-band { padding: 8px 12px; display: flex; justify-content: space-between; color: white; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .ticket-body { padding: 12px; background: white; }
    .ticket-body h2 { font-size: 14px; margin-bottom: 6px; color: #1a202c; }
    .date { font-size: 11px; color: #64748b; margin-bottom: 8px; }
    .venue { font-size: 11px; color: #64748b; margin-bottom: 10px; }
    .seat-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .seat-box { flex: 1; text-align: center; padding: 6px; background: #f8fafc; border-radius: 6px; }
    .seat-box small { display: block; font-size: 8px; color: #94a3b8; text-transform: uppercase; }
    .seat-box strong { font-size: 16px; color: #1a202c; }
    .seat-box.highlight { color: white; }
    .seat-box.highlight small { color: rgba(255,255,255,0.7); }
    .seat-box.highlight strong { color: white; }
    .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
    .ref { font-size: 9px; background: #f1f5f9; padding: 3px 6px; border-radius: 4px; color: #64748b; }
    .price { font-size: 14px; font-weight: 800; color: #1a202c; }
    .holder { font-size: 10px; color: #64748b; margin-top: 6px; }
    .message { font-size: 9px; color: #94a3b8; margin-top: 6px; font-style: italic; }
    .organizer { font-size: 9px; color: #94a3b8; margin-top: 4px; text-align: right; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="page">
    ${ticketCards}
  </div>
</body>
</html>`
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    STANDARD: '#0ea5e9',
    PREMIUM: '#a855f7',
    VIP: '#f59e0b',
    GENERAL: '#64748b'
  }
  return colors[tier] || '#0ea5e9'
}

function getGridColumns(layout: string): string {
  const map: Record<string, string> = {
    SINGLE: '1fr',
    TWO_COLUMN: '1fr 1fr',
    FOUR_GRID: '1fr 1fr',
    BADGE_SHEET: '1fr 1fr',
    AVERY_5160: '1fr 1fr 1fr',
    AVERY_5163: '1fr 1fr'
  }
  return map[layout] || '1fr'
}

function getPaperWidth(paperSize: string): number {
  const map: Record<string, number> = {
    A4: 210, A5: 148, LETTER: 216,
    THERMAL_80MM: 80, THERMAL_58MM: 58
  }
  return map[paperSize] || 210
}
