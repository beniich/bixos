import React from 'react'
import type { TicketData, TicketDesign } from '../../types/ticket'

interface BadgeLayoutProps {
  tickets: TicketData[]
  design: TicketDesign
}

// Dimensions en mm selon le layout choisi
const LAYOUT_CONFIG = {
  SINGLE: { cols: 1, rows: 1, badgeW: 190, badgeH: 270 },
  TWO_COLUMN: { cols: 2, rows: 1, badgeW: 90, badgeH: 140 },
  FOUR_GRID: { cols: 2, rows: 2, badgeW: 90, badgeH: 125 },
  BADGE_SHEET: { cols: 2, rows: 5, badgeW: 85, badgeH: 54 },
  AVERY_5160: { cols: 3, rows: 10, badgeW: 63, badgeH: 27 },
  AVERY_5163: { cols: 2, rows: 10, badgeW: 100, badgeH: 27 }
}

const BadgeLayout: React.FC<BadgeLayoutProps> = ({ tickets, design }) => {
  const cfg = LAYOUT_CONFIG[design.layout] || LAYOUT_CONFIG.TWO_COLUMN
  const perPage = cfg.cols * cfg.rows

  // Grouper les billets par pages
  const pages: TicketData[][] = []
  for (let i = 0; i < tickets.length; i += perPage) {
    pages.push(tickets.slice(i, i + perPage))
  }

  if (pages.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: 'rgba(255,255,255,0.4)' }}>
        <div style={{ fontSize: 48 }}>🎫</div>
        <p>Aucun billet sélectionné</p>
      </div>
    )
  }

  return (
    <div style={{ overflowY: 'auto', padding: 16 }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
        {pages.length} page{pages.length > 1 ? 's' : ''} d'impression · {tickets.length} billet{tickets.length > 1 ? 's' : ''} · Layout: {design.layout}
      </div>

      {pages.map((pageTickets, pageIndex) => (
        <div key={pageIndex}
          style={{
            background: '#fff',
            borderRadius: 8,
            marginBottom: 24,
            padding: `${design.marginMm * 3}px`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            display: 'grid',
            gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
            gap: `${design.spacingMm * 3}px`,
            width: '100%',
            maxWidth: 800
          }}
        >
          {pageTickets.map(ticket => (
            <BadgeCard key={ticket.id} ticket={ticket} design={design} compact={cfg.cols > 1} />
          ))}

          {/* Cellules vides pour compléter la grille */}
          {Array.from({ length: perPage - pageTickets.length }).map((_, i) => (
            <div key={`empty-${i}`}
              style={{ border: '2px dashed rgba(0,0,0,0.1)', borderRadius: 8, minHeight: 100 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

interface BadgeCardProps {
  ticket: TicketData
  design: TicketDesign
  compact: boolean
}

const TIER_COLORS: Record<string, string> = {
  STANDARD: '#0ea5e9',
  PREMIUM: '#a855f7',
  VIP: '#f59e0b',
  GENERAL: '#64748b'
}

const BadgeCard: React.FC<BadgeCardProps> = ({ ticket, design, compact }) => {
  const color = TIER_COLORS[ticket.tier] || design.primaryColor
  const fontSize = compact ? 9 : 11

  return (
    <div style={{
      background: design.backgroundColor,
      border: `2px solid ${color}`,
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
      fontFamily: "'Inter', sans-serif",
      color: design.textColor
    }}>
      {/* Bandeau coloré */}
      <div style={{ background: color, padding: compact ? '4px 8px' : '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: compact ? 8 : 10, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
          {ticket.tier}
        </span>
        {design.showLogo && (
          <span style={{ fontSize: compact ? 8 : 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
            ECOASSET
          </span>
        )}
      </div>

      <div style={{ padding: compact ? '6px 8px' : '10px 12px' }}>
        {/* Événement */}
        {design.fields.eventTitle && (
          <div style={{ fontSize: compact ? 10 : 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.2, color: design.textColor }}>
            {ticket.event.title}
          </div>
        )}

        {/* Date */}
        {design.fields.eventDate && (
          <div style={{ fontSize: fontSize, color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>
            📅 {new Date(ticket.event.startDate).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>
        )}

        {/* Siège */}
        {(design.fields.section || design.fields.seatRow) && (
          <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 6 }}>
            {design.fields.section && (
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: 6, padding: '3px 8px', flex: 1 }}>
                <div style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Section</div>
                <div style={{ fontSize: compact ? 11 : 14, fontWeight: 800, color }}>{ticket.seat.section}</div>
              </div>
            )}
            {design.fields.seatRow && (
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: 6, padding: '3px 8px', flex: 1 }}>
                <div style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Rangée</div>
                <div style={{ fontSize: compact ? 11 : 14, fontWeight: 800, color }}>{ticket.seat.row}</div>
              </div>
            )}
            {design.fields.seatNumber && (
              <div style={{ textAlign: 'center', background: color, borderRadius: 6, padding: '3px 8px', flex: 1 }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Siège</div>
                <div style={{ fontSize: compact ? 12 : 16, fontWeight: 800, color: '#fff' }}>{ticket.seat.number}</div>
              </div>
            )}
          </div>
        )}

        {/* Détenteur */}
        {design.fields.ticketHolder && !compact && (
          <div style={{ fontSize: 10, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 6, marginTop: 6 }}>
            <span style={{ color: 'rgba(0,0,0,0.4)' }}>Détenteur: </span>
            <strong>{ticket.holder.fullName}</strong>
          </div>
        )}

        {/* Référence */}
        {design.fields.reference && (
          <div style={{ fontFamily: 'monospace', fontSize: compact ? 7 : 9, color: color, marginTop: 4, textAlign: 'center', background: 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: 4 }}>
            {ticket.reference}
          </div>
        )}
      </div>

      {/* Statut overlay */}
      {ticket.status !== 'VALID' && (
        <div style={{
          position: 'absolute', inset: 0, background: ticket.status === 'USED' ? 'rgba(0,0,0,0.5)' : 'rgba(255,56,96,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900,
          color: ticket.status === 'USED' ? 'rgba(0,255,136,0.9)' : '#ff3860',
          transform: 'rotate(-12deg)', letterSpacing: 2
        }}>
          {ticket.status}
        </div>
      )}
    </div>
  )
}

export default BadgeLayout
