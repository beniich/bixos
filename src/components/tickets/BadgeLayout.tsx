import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { TicketData, TicketDesign } from '../../types/ticket'

interface BadgeLayoutProps {
  tickets: TicketData[]
  design: TicketDesign
}

const BadgeLayout: React.FC<BadgeLayoutProps> = ({ tickets, design }) => {
  // Dimensions A4 en mm
  const pageWidth = 210
  const pageHeight = 297

  // Configuration des layouts (colonnes × lignes, dimensions badge)
  const layoutConfig = {
    SINGLE:      { cols: 1, rows: 1,  perPage: 1,  width: 180, height: 250, gap: 0 },
    TWO_COLUMN:  { cols: 2, rows: 1,  perPage: 2,  width: 95,  height: 250, gap: 5 },
    FOUR_GRID:   { cols: 2, rows: 2,  perPage: 4,  width: 95,  height: 130, gap: 5 },
    BADGE_SHEET: { cols: 2, rows: 5,  perPage: 10, width: 90,  height: 54,  gap: 4 },
    AVERY_5160:  { cols: 3, rows: 10, perPage: 30, width: 66.7, height: 25.4, gap: 0 },
    AVERY_5163:  { cols: 2, rows: 5,  perPage: 10, width: 100, height: 50,  gap: 0 }
  }

  const config = layoutConfig[design.layout] || layoutConfig.TWO_COLUMN
  const margin = design.marginMm
  const spacing = design.spacingMm

  // Découpage en pages
  const pages: TicketData[][] = []
  for (let i = 0; i < tickets.length; i += config.perPage) {
    pages.push(tickets.slice(i, i + config.perPage))
  }

  if (tickets.length === 0) {
    return (
      <div className="bizos-empty">
        <div className="bizos-empty-icon">🎫</div>
        <p>Aucun billet à afficher dans la planche</p>
        <small>Sélectionnez des billets dans la grille</small>
      </div>
    )
  }

  return (
    <div className="badge-layout-wrapper">
      <div className="badge-layout-header">
        <h4>📐 Aperçu planche d'impression</h4>
        <p>
          {pages.length} page{pages.length > 1 ? 's' : ''} ·{' '}
          {config.cols}×{config.rows} ·{' '}
          {tickets.length} billet{tickets.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="badge-layout-preview">
        {pages.map((pageTickets, pageIndex) => (
          <div
            key={pageIndex}
            className="badge-page"
            style={{
              width: `${pageWidth}mm`,
              height: `${pageHeight}mm`,
              padding: `${margin}mm`,
              background: 'white',
              color: design.textColor,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto'
            }}
          >
            <div
              className="badge-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                gridTemplateRows: `repeat(${config.rows}, 1fr)`,
                gap: `${spacing}mm`,
                width: '100%',
                height: '100%'
              }}
            >
              {Array.from({ length: config.perPage }).map((_, idx) => {
                const ticket = pageTickets[idx]
                const isEmpty = !ticket

                return (
                  <div
                    key={idx}
                    className={`badge-cell-wrapper ${isEmpty ? 'empty' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {ticket && !isEmpty ? (
                      <BadgeTicket
                        ticket={ticket}
                        design={design}
                        width={config.width}
                        height={config.height}
                      />
                    ) : (
                      <div
                        className="badge-cell-empty-slot"
                        style={{
                          width: `${config.width}mm`,
                          height: `${config.height}mm`,
                          border: '1px dashed #ddd',
                          borderRadius: '4px'
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer pagination */}
            <div
              style={{
                position: 'absolute',
                bottom: '5mm',
                right: '8mm',
                fontSize: '8px',
                color: '#999',
                fontFamily: 'monospace'
              }}
            >
              ECOASSET · Page {pageIndex + 1} / {pages.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// BADGE TICKET (interne)
// ============================================
interface BadgeTicketProps {
  ticket: TicketData
  design: TicketDesign
  width: number
  height: number
}

const BadgeTicket: React.FC<BadgeTicketProps> = ({ ticket, design, width, height }) => {
  const isCompact = width < 70 || height < 35
  const isMiniLabel = width < 40
  const tierColors: Record<string, string> = {
    STANDARD: '#00e5ff',
    PREMIUM: '#ff00aa',
    VIP: '#ffb800',
    GENERAL: '#8b92a8'
  }
  const tierColor = tierColors[ticket.tier] || design.primaryColor

  if (isMiniLabel) {
    // Format étiquette Avery 5160 (très petit)
    return (
      <div
        className="badge-ticket mini-label"
        style={{
          width: `${width}mm`,
          height: `${height}mm`,
          background: design.backgroundColor,
          color: design.textColor,
          border: `1px solid ${tierColor}`,
          padding: '1mm',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: '6pt',
          lineHeight: 1.1,
          overflow: 'hidden'
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '7pt', marginBottom: '1mm' }}>
          {ticket.event.title.substring(0, 30)}
        </div>
        <div style={{ fontSize: '5pt', opacity: 0.7 }}>
          {ticket.holder.fullName} · {ticket.seat.section}{ticket.seat.row}{ticket.seat.number}
        </div>
        <div
          style={{
            marginTop: '1mm',
            fontFamily: 'monospace',
            fontSize: '5pt',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>{ticket.reference.substring(0, 8)}</span>
          <span style={{ color: tierColor, fontWeight: 700 }}>{ticket.tier.substring(0, 3)}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`badge-ticket ${isCompact ? 'compact' : ''}`}
      style={{
        width: `${width}mm`,
        height: `${height}mm`,
        background: design.backgroundColor,
        color: design.textColor,
        border: `2px solid ${tierColor}`,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header avec tier */}
      <div
        className="badge-ticket-header"
        style={{
          background: tierColor,
          color: 'white',
          padding: '2mm 3mm',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '7pt',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          {ticket.tier}
        </span>
        {design.showLogo && (
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '7pt',
              fontWeight: 800,
              letterSpacing: '1px'
            }}
          >
            ECOASSET
          </span>
        )}
      </div>

      {/* Body */}
      <div
        className="badge-ticket-body"
        style={{
          flex: 1,
          display: 'flex',
          padding: '3mm',
          gap: '3mm',
          minHeight: 0
        }}
      >
        {/* QR Code */}
        {design.showQrCode && !isCompact && (
          <div
            className="badge-ticket-qr"
            style={{
              background: 'white',
              padding: '1mm',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <QRCodeSVG
              value={ticket.qrPayload}
              size={Math.min(width, height) * 3.5}
              level="H"
              fgColor="#000000"
              bgColor="transparent"
            />
          </div>
        )}

        {/* Info */}
        <div
          className="badge-ticket-info"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
            gap: '1mm'
          }}
        >
          <div
            className="badge-ticket-name"
            style={{
              fontWeight: 700,
              fontSize: isCompact ? '8pt' : '10pt',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {ticket.holder.fullName}
          </div>

          <div
            className="badge-ticket-event"
            style={{
              fontSize: isCompact ? '7pt' : '8pt',
              opacity: 0.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {ticket.event.title}
          </div>

          <div
            className="badge-ticket-seat"
            style={{
              fontSize: isCompact ? '8pt' : '11pt',
              fontWeight: 700,
              color: tierColor
            }}
          >
            {ticket.seat.section} · {ticket.seat.row}
            <span style={{ fontSize: isCompact ? '14pt' : '18pt', marginLeft: '2mm' }}>
              {ticket.seat.number}
            </span>
          </div>

          {!isCompact && (
            <div
              className="badge-ticket-date"
              style={{ fontSize: '7pt', opacity: 0.7 }}
            >
              📅{' '}
              {new Date(ticket.event.startDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short'
              })}{' '}
              · 🕐{' '}
              {new Date(ticket.event.startDate).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="badge-ticket-footer"
        style={{
          padding: '1.5mm 3mm',
          background: 'rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '6pt'
        }}
      >
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: '6pt',
            letterSpacing: '0.5px'
          }}
        >
          {ticket.reference}
        </code>
        {design.fields.price && !isCompact && (
          <span style={{ fontWeight: 700, fontSize: '7pt', color: tierColor }}>
            {ticket.pricing.total.toFixed(2)} {ticket.pricing.currency}
          </span>
        )}
      </div>

      {/* Anti-copy code */}
      {design.antiCopyCode && (
        <div
          style={{
            position: 'absolute',
            bottom: '1mm',
            right: '1mm',
            fontFamily: 'monospace',
            fontSize: '4pt',
            opacity: 0.2
          }}
        >
          {ticket.signature.substring(0, 6).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default BadgeLayout
