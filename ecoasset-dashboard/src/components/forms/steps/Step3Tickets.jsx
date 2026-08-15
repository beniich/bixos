import React from 'react'
import TicketBuilder from '../shared/TicketBuilder'

const DEFAULT_TICKET = {
  name: '', tier: 'standard', price: '', quantity: '',
  description: '', minPerOrder: 1, maxPerOrder: 8,
  saleStartsAt: '', saleEndsAt: '', includes: []
}

export default function Step3Tickets({ data, update }) {
  const set = (field) => (value) => update({ ...data, [field]: value })

  const addTicket = () => set('tickets')([...(data.tickets || []), { ...DEFAULT_TICKET }])

  const updateTicket = (i, value) => {
    const tickets = [...(data.tickets || [])]
    tickets[i] = value
    set('tickets')(tickets)
  }

  const removeTicket = (i) => set('tickets')((data.tickets || []).filter((_, idx) => idx !== i))

  const totalStock = (data.tickets || []).reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0)

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">🎫 Billets & Tarification</h2>
        <p className="step-subtitle">Définissez les types de billets proposés</p>
      </div>

      <div className="alert alert-info">
        <span>💡</span>
        <span>Proposez plusieurs tarifs pour toucher un public plus large.</span>
      </div>

      {(data.tickets || []).map((ticket, i) => (
        <TicketBuilder key={i} ticket={ticket} index={i}
          onChange={(val) => updateTicket(i, val)}
          onRemove={() => removeTicket(i)} />
      ))}

      <button className="add-ticket-btn" onClick={addTicket} type="button">
        <span style={{ fontSize: 18 }}>+</span>
        <span>Ajouter un type de billet</span>
      </button>

      {totalStock > 0 && (
        <div className="alert alert-success" style={{ marginTop: 20 }}>
          <span>📊</span>
          <span>
            <strong>{totalStock.toLocaleString()}</strong> billets au total sur{' '}
            <strong>{(data.tickets || []).length}</strong> type{(data.tickets || []).length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
