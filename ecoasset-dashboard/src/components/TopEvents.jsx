import React from 'react'

export default function TopEvents({ events }) {
  return (
    <div className="glass">
      <div className="chart-header">
        <h3 className="chart-title">🏆 Top Événements</h3>
        <span className="badge badge-info">Ce mois</span>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Événement</th>
              <th>Taux</th>
              <th>Revenus</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, i) => (
              <tr key={i}>
                <td>
                  <div className="event-cell">
                    <div className="event-img">{event.emoji}</div>
                    <div>
                      <div className="event-name">{event.name}</div>
                      <div className="event-meta">📍 {event.venue}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${event.sold}%` }}
                      ></div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{event.sold}%</span>
                  </div>
                </td>
                <td style={{ fontFamily: 'Orbitron', fontWeight: 700 }}>{event.revenue}</td>
                <td>
                  <span className="badge badge-success">▲ {event.trend}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
