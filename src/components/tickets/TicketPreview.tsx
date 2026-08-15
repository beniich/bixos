import React, { useState } from 'react'
import type { TicketData, TicketDesign } from '../../types/ticket'

interface TicketPreviewProps {
  ticket: TicketData
  design: TicketDesign
  interactive?: boolean
  compact?: boolean
  onClick?: () => void
}

const TIER_COLORS: Record<string, string> = {
  STANDARD: '#00e5ff',
  PREMIUM: '#ff00aa',
  VIP: '#ffb800',
  GENERAL: '#8b92a8'
}

const TicketPreview: React.FC<TicketPreviewProps> = ({
  ticket, design, interactive = true, compact = false, onClick
}) => {
  const [flipped, setFlipped] = useState(false)

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })

  const tierColor = TIER_COLORS[ticket.tier] || design.primaryColor

  const cardStyle: React.CSSProperties = {
    background: design.backgroundColor,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    fontFamily: "'Inter', sans-serif",
    color: design.textColor,
    boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px ${tierColor}30`,
    cursor: interactive ? 'pointer' : 'default',
    userSelect: 'none',
    transition: 'transform 0.3s',
    maxWidth: compact ? 280 : 420,
    minHeight: compact ? 120 : 220
  }

  const currentFace = flipped ? 'back' : 'front'

  return (
    <div style={cardStyle} onClick={() => interactive && setFlipped(f => !f)}>
      {/* Top Band */}
      <div style={{ background: `linear-gradient(135deg, ${tierColor}, ${design.accentColor})`, padding: compact ? '8px 12px' : '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: compact ? 10 : 12, fontWeight: 800, color: '#fff', letterSpacing: 1, textTransform: 'uppercase' }}>
          {ticket.tier} · {ticket.ticketName}
        </span>
        {design.showLogo && (
          <span style={{ fontSize: compact ? 10 : 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>ECOASSET</span>
        )}
      </div>

      {currentFace === 'front' ? (
        <div style={{ padding: compact ? '10px 12px' : '16px' }}>
          {design.fields.eventTitle && (
            <h3 style={{ margin: '0 0 4px 0', fontSize: compact ? 14 : 18, fontWeight: 800, color: design.textColor }}>
              {ticket.event.title}
            </h3>
          )}
          {ticket.event.subtitle && !compact && (
            <p style={{ margin: '0 0 12px 0', fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{ticket.event.subtitle}</p>
          )}

          {!compact && (
            <div style={{ display: 'flex', gap: 16, margin: '12px 0' }}>
              {design.fields.eventDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📅</span>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{formatDate(ticket.event.startDate)}</div>
                  </div>
                </div>
              )}
              {design.fields.eventTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🕐</span>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Heure</div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{formatTime(ticket.event.startDate)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {design.fields.venueName && (
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)', marginBottom: 8 }}>
              📍 {ticket.venue.name}{design.fields.venueAddress && !compact ? `, ${ticket.venue.city}` : ''}
            </div>
          )}

          {/* Seat block */}
          <div style={{ display: 'flex', gap: 8, padding: '8px 0', borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)', margin: '8px 0' }}>
            {design.fields.section && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Section</div>
                <div style={{ fontSize: compact ? 14 : 20, fontWeight: 800, color: tierColor }}>{ticket.seat.section}</div>
              </div>
            )}
            {design.fields.seatRow && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Rangée</div>
                <div style={{ fontSize: compact ? 14 : 20, fontWeight: 800, color: tierColor }}>{ticket.seat.row}</div>
              </div>
            )}
            {design.fields.seatNumber && (
              <div style={{ textAlign: 'center', flex: 1, background: tierColor, borderRadius: 8, padding: '4px 8px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Siège</div>
                <div style={{ fontSize: compact ? 16 : 24, fontWeight: 900, color: '#fff' }}>{ticket.seat.number}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {design.fields.reference && (
              <code style={{ fontSize: compact ? 8 : 10, background: 'rgba(0,0,0,0.06)', padding: '3px 8px', borderRadius: 6, color: tierColor }}>
                {ticket.reference}
              </code>
            )}
            {design.fields.price && (
              <div style={{ fontSize: compact ? 12 : 15, fontWeight: 800, color: tierColor }}>
                {ticket.pricing.total.toFixed(2)} {ticket.pricing.currency}
              </div>
            )}
          </div>

          {interactive && (
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: 'rgba(0,0,0,0.3)' }}>
              Cliquez pour voir le verso ↩
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: compact ? '10px 12px' : '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* QR Code placeholder (qrcode.react non installé ici) */}
          {design.showQrCode && (
            <div style={{ width: design.qrSize, height: design.qrSize, background: 'rgba(0,0,0,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              ▦
            </div>
          )}
          <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>Scannez à l'entrée</div>

          {design.fields.ticketHolder && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Détenteur</div>
              <div style={{ fontWeight: 700 }}>{ticket.holder.fullName}</div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>{ticket.holder.email}</div>
            </div>
          )}

          {design.customMessage && (
            <div style={{ fontSize: 10, textAlign: 'center', color: 'rgba(0,0,0,0.5)', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 8, width: '100%' }}>
              {design.customMessage}
            </div>
          )}

          {design.showOrganizer && (
            <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', textAlign: 'center' }}>
              Organisé par <strong>{ticket.event.organizer.name}</strong>
            </div>
          )}
        </div>
      )}

      {/* Status overlay */}
      {ticket.status !== 'VALID' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)'
        }}>
          <div style={{ transform: 'rotate(-15deg)', fontSize: 24, fontWeight: 900, padding: '4px 16px',
            border: `3px solid ${ticket.status === 'USED' ? '#10b981' : '#ff3860'}`,
            color: ticket.status === 'USED' ? '#10b981' : '#ff3860', borderRadius: 8, letterSpacing: 2 }}>
            {ticket.status}
          </div>
        </div>
      )}

      {design.antiCopyCode && (
        <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 7, color: 'rgba(0,0,0,0.15)', fontFamily: 'monospace' }}>
          {ticket.signature.substring(0, 8).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default TicketPreview
