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
  customMessage: "Présentez ce billet à l'entrée. Billet non remboursable.",
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

  const handleGeneratePDF = useCallback(async () => {
    if (printConfig.tickets.length === 0) {
      alert('Veuillez sélectionner au moins un billet')
      return
    }

    setGenerating(true)
    setGeneratingProgress(0)

    try {
      const blob = await generatePDF(printConfig, (progress) => {
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

  const selectAll = () => setSelectedTicketIds(new Set(tickets.map(t => t.id)))
  const deselectAll = () => setSelectedTicketIds(new Set())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bizos-bg, #0a0e1a)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>🎫 Génération de Billets</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            {tickets.length} billet{tickets.length > 1 ? 's' : ''} disponible{tickets.length > 1 ? 's' : ''} ·{' '}
            <strong style={{ color: '#00e5ff' }}>{selectedTicketIds.size}</strong> sélectionné{selectedTicketIds.size > 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 8 }}>
          {[
            { id: 'preview', label: '👁 Aperçu' },
            { id: 'grid', label: '▦ Grille' },
            { id: 'sheet', label: '🖨 Planche' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              style={{
                padding: '6px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: activeView === view.id ? 'rgba(0,229,255,0.15)' : 'transparent',
                color: activeView === view.id ? '#00e5ff' : 'rgba(255,255,255,0.5)'
              }}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Config */}
        <aside style={{ width: 360, minWidth: 360, borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
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

        {/* Workspace */}
        <main style={{ flex: 1, overflow: 'auto', padding: 24, position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
          {activeView === 'preview' && (
            <div ref={previewRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
              {printConfig.tickets.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 100 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
                  <p>Sélectionnez des billets pour voir l'aperçu</p>
                </div>
              ) : (
                <>
                  {printConfig.tickets.slice(0, 3).map(ticket => (
                    <TicketPreview key={ticket.id} ticket={ticket} design={design} />
                  ))}
                  {printConfig.tickets.length > 3 && (
                    <div style={{ width: '100%', textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                      + {printConfig.tickets.length - 3} autres billets
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeView === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {tickets.map(ticket => (
                <label key={ticket.id} style={{ display: 'block', cursor: 'pointer', position: 'relative' }}>
                  <input
                    type="checkbox"
                    checked={selectedTicketIds.has(ticket.id)}
                    onChange={() => toggleTicket(ticket.id)}
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 20, height: 20, accentColor: '#00e5ff' }}
                  />
                  <div style={{ opacity: selectedTicketIds.has(ticket.id) ? 1 : 0.5, transition: 'opacity 0.2s', border: selectedTicketIds.has(ticket.id) ? '2px solid #00e5ff' : '2px solid transparent', borderRadius: 14 }}>
                    <TicketPreview ticket={ticket} design={design} interactive={false} compact />
                  </div>
                </label>
              ))}
            </div>
          )}

          {activeView === 'sheet' && (
            <BadgeLayout tickets={printConfig.tickets} design={design} />
          )}
        </main>
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          {generating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="bizos-loader-spinner" style={{ width: 16, height: 16, border: '2px solid rgba(0,229,255,0.2)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>Génération en cours... {generatingProgress}%</span>
            </div>
          ) : (
            <span>Format: {design.format} · {design.layout} · {design.paperSize}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handlePrint}
            disabled={generating || selectedTicketIds.size === 0}
            style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', cursor: (generating || selectedTicketIds.size === 0) ? 'not-allowed' : 'pointer', opacity: (generating || selectedTicketIds.size === 0) ? 0.5 : 1, fontWeight: 600 }}
          >
            🖨 Imprimer
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={generating || selectedTicketIds.size === 0}
            style={{ padding: '10px 20px', background: '#00e5ff', border: 'none', borderRadius: 8, color: '#0a0e1a', cursor: (generating || selectedTicketIds.size === 0) ? 'not-allowed' : 'pointer', opacity: (generating || selectedTicketIds.size === 0) ? 0.5 : 1, fontWeight: 800, boxShadow: '0 0 15px rgba(0,229,255,0.3)' }}
          >
            {generating ? '⟳ Génération...' : '📄 Télécharger PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketGenerator
