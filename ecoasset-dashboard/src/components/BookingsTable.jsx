import React from 'react'

const statusConfig = {
  confirmed: { label: 'Confirmée', class: 'badge-success' },
  pending: { label: 'En attente', class: 'badge-warning' },
  cancelled: { label: 'Annulée', class: 'badge-danger' }
}

export default function BookingsTable({ bookings }) {
  return (
    <div className="glass">
      <div className="chart-header">
        <h3 className="chart-title">🎟️ Dernières Réservations</h3>
        <button className="chart-tab" style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff' }}>
          Voir tout →
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Client</th>
              <th>Événement</th>
              <th>Billets</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.ref}>
                <td>
                  <code style={{
                    fontFamily: 'monospace',
                    background: 'rgba(0, 240, 255, 0.1)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#00f0ff'
                  }}>
                    {booking.ref}
                  </code>
                </td>
                <td>{booking.customer}</td>
                <td>{booking.event}</td>
                <td>× {booking.tickets}</td>
                <td style={{ fontFamily: 'Orbitron', fontWeight: 700 }}>
                  {booking.amount}€
                </td>
                <td>
                  <span className={`badge ${statusConfig[booking.status].class}`}>
                    {statusConfig[booking.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
