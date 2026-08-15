import React from 'react'
import FormField from './FormField'

const TIERS = {
  standard: { label: 'Standard', class: 'standard' },
  premium: { label: 'Premium', class: 'premium' },
  vip: { label: 'VIP', class: 'vip' }
}

export default function TicketBuilder({ ticket, index, onChange, onRemove }) {
  const update = (field, value) => onChange({ ...ticket, [field]: value })

  const addInclude = (val) => {
    if (!val.trim()) return
    onChange({ ...ticket, includes: [...(ticket.includes || []), val.trim()] })
  }

  const removeInclude = (i) => {
    onChange({ ...ticket, includes: ticket.includes.filter((_, idx) => idx !== i) })
  }

  const tier = TIERS[ticket.tier] || TIERS.standard

  return (
    <div className="ticket-builder">
      <div className="ticket-builder-header">
        <div className="ticket-builder-title">
          <span className={`badge-tier ${tier.class}`}>{tier.label}</span>
          <span>·</span>
          <span>Type #{index + 1}</span>
        </div>
        <button type="button" className="btn-remove-ticket" onClick={onRemove}>✕</button>
      </div>

      <div className="form-grid-3">
        <FormField label="Nom du billet" required>
          <input className="form-input" value={ticket.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ex: Early Bird" />
        </FormField>
        <FormField label="Type" required>
          <select className="form-select" value={ticket.tier}
            onChange={(e) => update('tier', e.target.value)}>
            <option value="standard">⚡ Standard</option>
            <option value="premium">💎 Premium</option>
            <option value="vip">👑 VIP</option>
          </select>
        </FormField>
        <FormField label="Prix (€)" required>
          <input type="number" className="form-input" value={ticket.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="0.00" min="0" step="0.01" />
        </FormField>
      </div>

      <div className="form-grid-3">
        <FormField label="Stock disponible" required>
          <input type="number" className="form-input" value={ticket.quantity}
            onChange={(e) => update('quantity', e.target.value)}
            placeholder="Ex: 200" min="1" />
        </FormField>
        <FormField label="Min / commande">
          <input type="number" className="form-input" value={ticket.minPerOrder}
            onChange={(e) => update('minPerOrder', e.target.value)}
            min="1" max="10" />
        </FormField>
        <FormField label="Max / commande">
          <input type="number" className="form-input" value={ticket.maxPerOrder}
            onChange={(e) => update('maxPerOrder', e.target.value)}
            min="1" max="20" />
        </FormField>
      </div>

      <div className="form-grid">
        <FormField label="Vente — Début">
          <input type="datetime-local" className="form-input" value={ticket.saleStartsAt}
            onChange={(e) => update('saleStartsAt', e.target.value)} />
        </FormField>
        <FormField label="Vente — Fin">
          <input type="datetime-local" className="form-input" value={ticket.saleEndsAt}
            onChange={(e) => update('saleEndsAt', e.target.value)} />
        </FormField>
      </div>

      <FormField label="Description" hint="Décrivez ce qui est inclus">
        <textarea className="form-textarea" value={ticket.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Accès à l'événement, places debout, etc." rows="2" />
      </FormField>

      <div className="ticket-includes">
        <div className="ticket-includes-label">✨ Avantages inclus</div>
        <div className="ticket-includes-list">
          {(ticket.includes || []).map((inc, i) => (
            <span key={i} className="ticket-include-chip">
              ✓ {inc}
              <button type="button" className="ticket-include-chip-remove"
                onClick={() => removeInclude(i)}>×</button>
            </span>
          ))}
        </div>
        <div className="ticket-include-add">
          <input type="text" placeholder="Ex: Place assise numérotée"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addInclude(e.target.value)
                e.target.value = ''
              }
            }} />
          <button type="button"
            onClick={(e) => {
              const input = e.target.previousElementSibling
              addInclude(input.value)
              input.value = ''
            }}>+</button>
        </div>
      </div>
    </div>
  )
}
