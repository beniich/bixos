import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { TicketData, TicketDesign } from '../../types/ticket'

interface TicketPreviewProps {
  ticket: TicketData
  design: TicketDesign
  interactive?: boolean
  compact?: boolean
  onClick?: () => void
}

const TicketPreview: React.FC<TicketPreviewProps> = ({
  ticket,
  design,
  interactive = true,
  compact = false,
  onClick
}) => {
  const [flipped, setFlipped] = useState(false)

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })

  const tierColors: Record<string, string> = {
    STANDARD: '#00e5ff',
    PREMIUM: '#ff00aa',
    VIP: '#ffb800',
    GENERAL: '#8b92a8'
  }

  const tierColor = tierColors[ticket.tier] || design.primaryColor

  return (
    <div
      className={`ticket-preview design-${design.format.toLowerCase()} ${compact ? 'compact' : ''} ${interactive ? 'interactive' : ''} ${flipped ? 'flipped' : ''}`}
      onClick={() => interactive && setFlipped(!flipped)}
    >
      <div className="ticket-preview-inner">
        {/* RECTO */}
        <div
          className="ticket-face ticket-front"
          style={{
            '--ticket-primary': tierColor,
            '--ticket-bg': design.backgroundColor,
            '--ticket-text': design.textColor
          } as React.CSSProperties}
        >
          {/* Bandeau supérieur avec tier */}
          <div className="ticket-tier-band">
            <span className="ticket-tier-label">{ticket.tier}</span>
            {design.showLogo && (
              <div className="ticket-logo">
                {design.logoUrl ? (
                  <img src={design.logoUrl} alt="Logo" />
                ) : (
                  <span className="ticket-logo-text">ECOASSET</span>
                )}
              </div>
            )}
          </div>

          {/* Titre événement */}
          {design.fields.eventTitle && (
            <div className="ticket-event">
              <h3 className="ticket-event-title">{ticket.event.title}</h3>
              {ticket.event.subtitle && (
                <p className="ticket-event-subtitle">{ticket.event.subtitle}</p>
              )}
            </div>
          )}

          {/* Date & Heure */}
          {design.format !== 'COMPACT' && (
            <div className="ticket-date-block">
              {design.fields.eventDate && (
                <div className="ticket-info-block">
                  <span className="ticket-info-icon">📅</span>
                  <div>
                    <small>Date</small>
                    <strong>{formatDate(ticket.event.startDate)}</strong>
                  </div>
                </div>
              )}
              {design.fields.eventTime && (
                <div className="ticket-info-block">
                  <span className="ticket-info-icon">🕐</span>
                  <div>
                    <small>Heure</small>
                    <strong>{formatTime(ticket.event.startDate)}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lieu */}
          {(design.fields.venueName || design.fields.venueAddress) && (
            <div className="ticket-venue">
              {design.fields.venueName && (
                <div className="ticket-venue-name">
                  <span>📍</span> {ticket.venue.name}
                </div>
              )}
              {design.fields.venueAddress && !compact && (
                <div className="ticket-venue-address">
                  {ticket.venue.address}, {ticket.venue.city}
                </div>
              )}
            </div>
          )}

          {/* Siège */}
          {(design.fields.seatRow || design.fields.section) && (
            <div className="ticket-seat-block">
              <div className="ticket-seat-main">
                {design.fields.section && (
                  <div className="ticket-seat-info">
                    <small>Section</small>
                    <strong>{ticket.seat.section}</strong>
                  </div>
                )}
                {design.fields.seatRow && (
                  <div className="ticket-seat-info">
                    <small>Rangée</small>
                    <strong>{ticket.seat.row}</strong>
                  </div>
                )}
                {design.fields.seatNumber && (
                  <div className="ticket-seat-info ticket-seat-number">
                    <small>Siège</small>
                    <strong className="ticket-seat-num-highlight">
                      {ticket.seat.number}
                    </strong>
                  </div>
                )}
              </div>
              {design.fields.category && (
                <div className="ticket-category-chip" style={{ background: ticket.seat.color }}>
                  {ticket.seat.category}
                </div>
              )}
            </div>
          )}

          {/* QR Code (recto) */}
          {design.showQrCode && !flipped && design.format === 'STANDARD' && (
            <div className="ticket-qr-front">
              <QRCodeSVG
                value={ticket.qrPayload}
                size={design.qrSize}
                level="H"
                fgColor={design.textColor}
                bgColor="transparent"
              />
            </div>
          )}

          {/* Watermark hologramme */}
          {design.holographicEffect && (
            <div className="ticket-hologram" />
          )}

          {/* Footer avec référence */}
          <div className="ticket-footer">
            {design.fields.reference && (
              <code className="ticket-reference">{ticket.reference}</code>
            )}
            {design.fields.price && (
              <div className="ticket-price">
                {ticket.pricing.total.toFixed(2)} {ticket.pricing.currency}
              </div>
            )}
          </div>

          {/* Anti-copy code */}
          {design.antiCopyCode && (
            <div className="ticket-anti-copy">
              {ticket.signature.substring(0, 8).toUpperCase()}
            </div>
          )}

          {/* Watermark personnalisé */}
          {design.watermark && (
            <div className="ticket-watermark">{design.watermark}</div>
          )}
        </div>

        {/* VERSO */}
        <div
          className="ticket-face ticket-back"
          style={{
            '--ticket-primary': tierColor,
            '--ticket-bg': design.backgroundColor,
            '--ticket-text': design.textColor
          } as React.CSSProperties}
        >
          {/* QR Code principal (verso) */}
          {design.showQrCode && design.format !== 'COMPACT' && (
            <div className="ticket-qr-back">
              <QRCodeSVG
                value={ticket.qrPayload}
                size={design.qrSize + 20}
                level="H"
                fgColor={design.textColor}
                bgColor="transparent"
              />
              <small className="ticket-qr-instruction">
                Scannez à l'entrée
              </small>
            </div>
          )}

          {/* Détenteur */}
          {design.fields.ticketHolder && (
            <div className="ticket-holder">
              <small>Détenteur</small>
              <strong>{ticket.holder.fullName}</strong>
            </div>
          )}

          {/* Type de billet */}
          {design.fields.ticketType && (
            <div className="ticket-type-info">
              <small>Type</small>
              <strong>{ticket.ticketName}</strong>
            </div>
          )}

          {/* Porte d'entrée */}
          {design.fields.gate && ticket.gate && (
            <div className="ticket-gate-info">
              <span>🚪</span> Porte <strong>{ticket.gate}</strong>
            </div>
          )}

          {/* Message personnalisé */}
          {design.customMessage && (
            <div className="ticket-custom-message">
              {design.customMessage}
            </div>
          )}

          {/* Conditions */}
          {design.showTerms && !compact && (
            <div className="ticket-terms">
              <h5>Conditions</h5>
              <ul>
                <li>Billet nominatif, non transférable</li>
                <li>Présentation d'une pièce d'identité requise</li>
                <li>Arrivée recommandée 30 min avant le début</li>
              </ul>
            </div>
          )}

          {design.showRefundPolicy && !compact && (
            <div className="ticket-refund">
              <h5>Politique de remboursement</h5>
              <p>Remboursement intégral jusqu'à 7 jours avant l'événement. Frais de traitement non remboursables.</p>
            </div>
          )}

          {/* Organisateur */}
          {design.showOrganizer && !compact && (
            <div className="ticket-organizer">
              <small>Organisé par</small>
              <strong>{ticket.event.organizer.name}</strong>
            </div>
          )}

          {/* Code-barres */}
          {design.showBarcode && (
            <div className="ticket-barcode">
              {generateBarcodeSVG(ticket.reference)}
            </div>
          )}
        </div>
      </div>

      {/* Badge de statut */}
      {ticket.status !== 'VALID' && (
        <div className={`ticket-status-overlay status-${ticket.status.toLowerCase()}`}>
          {ticket.status === 'USED' && '✓ UTILISÉ'}
          {ticket.status === 'CANCELLED' && '✕ ANNULÉ'}
          {ticket.status === 'RESERVED' && '◌ RÉSERVÉ'}
        </div>
      )}
    </div>
  )
}

const generateBarcodeSVG = (code: string): React.ReactElement => {
  // Génération simplifiée d'un code-barres Code 128 visuel
  const bars: number[] = []
  for (let i = 0; i < code.length; i++) {
    bars.push(code.charCodeAt(i) % 7 + 1)
  }

  return (
    <svg height="40" width="200" viewBox="0 0 200 40">
      {bars.map((width, i) => (
        <rect
          key={i}
          x={bars.slice(0, i).reduce((s, w) => s + w, 0)}
          y={0}
          width={width}
          height={30}
          fill="currentColor"
        />
      ))}
      <text x="100" y="38" textAnchor="middle" fontSize="8" fill="currentColor">
        {code}
      </text>
    </svg>
  )
}

export default TicketPreview
