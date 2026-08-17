import React, { useState, useMemo, useRef, useCallback } from 'react'
import type { TicketData, TicketDesign, PrintConfig, PrintLayout, PaperSize, TicketFormat } from '../../types/ticket'
import TicketPreview from './TicketPreview'
import PrintConfigPanel from './PrintConfigPanel'
import BadgeLayout from './BadgeLayout'
import { generatePDF } from '../../utils/pdfGenerator'
import { downloadAsPDF, printPDF } from '../../utils/pdfExporter'

interface TicketGeneratorProps {
  tickets: TicketData[]
  eventContext?: {
    id: string
    title: string
    organizer: string
  }
  onGenerate?: (config: PrintConfig) => Promise<void>
  onPrint?: (config: PrintConfig) => void
  onSaveDesign?: (design: TicketDesign) => void
  initialDesign?: TicketDesign
}

const DEFAULT_DESIGN: TicketDesign = {
  format: 'STANDARD',
  paperSize: 'A4',
  layout: 'TWO_COLUMN',
  orientation: 'portrait',
  marginMm: 10,
  spacingMm: 5,
  showLogo: true,
  primaryColor: '#00e5ff',
  secondaryColor: '#0a0e1a',
  accentColor: '#ff00aa',
  backgroundColor: '#ffffff',
  textColor: '#0a0e1a',
  showQrCode: true,
  qrSize: 120,
  showBarcode: false,
  showSeatMap: false,
  showEventLogo: true,
  showOrganizer: true,
  showTerms: true,
  showRefundPolicy: true,
  customMessage: 'Présentez ce billet à l\'entrée. Billet non remboursable.',
  fields: {
    eventTitle: true,
    eventDate: true,
    eventTime: true,
    venueName: true,
    venueAddress: true,
    seatRow: true,
    seatNumber: true,
    section: true,
    category: true,
    ticketHolder: true,
    ticketType: true,
    price: true,
    reference: true,
    gate: true
  },
  holographicEffect: false,
  antiCopyCode: true
}

const TicketGenerator: React.FC<TicketGeneratorProps> = ({
  tickets,
  eventContext,
  onGenerate,
  onPrint,
  onSaveDesign,
  initialDesign
}) => {
  const [design, setDesign] = useState<TicketDesign>(initialDesign || DEFAULT_DESIGN)
  const [activeView, setActiveView] = useState<'preview' | 'grid' | 'sheet'>('preview')
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(
    new Set(tickets.map(t => t.id))
  )
  const [generating, setGenerating] = useState(false)
  const [generatingProgress, setGeneratingProgress] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)

  const printConfig: PrintConfig = useMemo(() => ({
    design,
    tickets: tickets.filter(t => selectedTicketIds.has(t.id)),
    copies: 1,
    grouping: 'INDIVIDUAL',
    sortBy: 'REFERENCE',
    autoOpenPrint: false,
    includeBackupPdf: true,
    pdfFilename: `billets-${eventContext?.title || 'event'}-${Date.now()}`
  }), [design, tickets, selectedTicketIds, eventContext])

  // ============================================
  // GÉNÉRATION PDF
  // ============================================
  const handleGeneratePDF = useCallback(async () => {
    if (printConfig.tickets.length === 0) {
      alert('Veuillez sélectionner au moins un billet')
      return
    }

    setGenerating(true)
    setGeneratingProgress(0)

    try {
      const blob = await generatePDF(printConfig, (progress: number) => {
        setGeneratingProgress(progress)
      })

      await downloadAsPDF(blob, `${printConfig.pdfFilename}.pdf`)

      if (onGenerate) {
        await onGenerate(printConfig)
      }
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
      setGeneratingProgress(0)
    }
  }, [printConfig, onGenerate])

  // ============================================
  // IMPRESSION DIRECTE
  // ============================================
  const handlePrint = useCallback(async () => {
    if (printConfig.tickets.length === 0) {
      alert('Veuillez sélectionner au moins un billet')
      return
    }

    setGenerating(true)

    try {
      const blob = await generatePDF(printConfig)
      await printPDF(blob)

      if (onPrint) {
        onPrint(printConfig)
      }
    } catch (error) {
      console.error('Erreur impression:', error)
    } finally {
      setGenerating(false)
    }
  }, [printConfig, onPrint])

  // ============================================
  // SÉLECTION
  // ============================================
  const toggleTicket = (id: string) => {
    setSelectedTicketIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedTicketIds(new Set(tickets.map(t => t.id)))
  }

  const deselectAll = () => {
    setSelectedTicketIds(new Set())
  }

  return (
    <div className="ticket-generator">
      <div className="ticket-generator-header">
        <div>
          <h2>🎫 Génération de Billets</h2>
          <p>
            {tickets.length} billet{tickets.length > 1 ? 's' : ''} disponible{tickets.length > 1 ? 's' : ''}
            {' · '}
            <strong>{selectedTicketIds.size}</strong> sélectionné{selectedTicketIds.size > 1 ? 's' : ''}
          </p>
        </div>

        <div className="ticket-generator-actions">
          <button
            className="bizos-btn bizos-btn-secondary"
            onClick={() => setActiveView('preview')}
            disabled={activeView === 'preview'}
          >
            👁 Aperçu
          </button>
          <button
            className="bizos-btn bizos-btn-secondary"
            onClick={() => setActiveView('grid')}
            disabled={activeView === 'grid'}
          >
            ▦ Grille
          </button>
          <button
            className="bizos-btn bizos-btn-secondary"
            onClick={() => setActiveView('sheet')}
            disabled={activeView === 'sheet'}
          >
            🖨 Planche
          </button>
        </div>
      </div>

      <div className="ticket-generator-layout">
        {/* Colonne configuration (gauche) */}
        <aside className="ticket-generator-config">
          <PrintConfigPanel
            design={design}
            onChange={setDesign}
            onSave={onSaveDesign}
            ticketCount={selectedTicketIds.size}
            stats={{
              total: tickets.length,
              selected: selectedTicketIds.size,
              valid: tickets.filter(t => t.status === 'VALID').length,
              used: tickets.filter(t => t.status === 'USED').length
            }}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
          />
        </aside>

        {/* Zone principale (centre) */}
        <main className="ticket-generator-main">
          {activeView === 'preview' && (
            <div className="ticket-preview-wrapper" ref={previewRef}>
              {printConfig.tickets.length === 0 ? (
                <div className="bizos-empty">
                  <div className="bizos-empty-icon">🎫</div>
                  <p>Sélectionnez des billets pour voir l'aperçu</p>
                </div>
              ) : (
                <div className="ticket-preview-list">
                  {printConfig.tickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} className="ticket-preview-item">
                      <TicketPreview
                        ticket={ticket}
                        design={design}
                        interactive={false}
                      />
                    </div>
                  ))}
                  {printConfig.tickets.length > 3 && (
                    <div className="ticket-preview-more">
                      + {printConfig.tickets.length - 3} autres billets
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeView === 'grid' && (
            <div className="ticket-grid">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`ticket-grid-item ${selectedTicketIds.has(ticket.id) ? 'selected' : ''}`}
                >
                  <label className="ticket-grid-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTicketIds.has(ticket.id)}
                      onChange={() => toggleTicket(ticket.id)}
                    />
                    <TicketPreview
                      ticket={ticket}
                      design={design}
                      interactive={false}
                      compact
                    />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeView === 'sheet' && (
            <BadgeLayout
              tickets={printConfig.tickets}
              design={design}
            />
          )}
        </main>
      </div>

      {/* Footer actions */}
      <div className="ticket-generator-footer">
        <div className="ticket-generator-info">
          {generating ? (
            <div className="generation-progress">
              <div className="bizos-loader-spinner" />
              <span>Génération en cours... {generatingProgress}%</span>
              <div className="progress-bar-mini">
                <div
                  className="progress-fill-mini"
                  style={{ width: `${generatingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <span>Format: {design.format} · {design.layout} · {design.paperSize}</span>
          )}
        </div>

        <div className="ticket-generator-buttons">
          <button
            className="bizos-btn bizos-btn-secondary"
            onClick={handlePrint}
            disabled={generating || selectedTicketIds.size === 0}
          >
            🖨 Imprimer
          </button>
          <button
            className="bizos-btn bizos-btn-primary"
            onClick={handleGeneratePDF}
            disabled={generating || selectedTicketIds.size === 0}
          >
            {generating ? '⟳ Génération...' : '📄 Télécharger PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketGenerator
