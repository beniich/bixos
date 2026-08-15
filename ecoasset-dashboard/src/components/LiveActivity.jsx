import React from 'react'

export default function LiveActivity({ activities }) {
  const colorMap = {
    cyber: 'rgba(0, 240, 255, 0.2)',
    purple: 'rgba(181, 55, 242, 0.2)',
    pink: 'rgba(255, 0, 110, 0.2)',
    green: 'rgba(0, 255, 136, 0.2)'
  }

  const iconMap = {
    booking: '🎫',
    review: '⭐',
    checkin: '✓',
    refund: '↩'
  }

  return (
    <div className="glass">
      <div className="chart-header">
        <h3 className="chart-title">
          <span style={{ display: 'inline-block', width: 8, height: 8, background: '#00ff88', borderRadius: '50%', marginRight: 8, boxShadow: '0 0 8px #00ff88', animation: 'pulse 2s infinite' }}></span>
          Activité Live
        </h3>
        <span className="badge badge-success">EN DIRECT</span>
      </div>
      <div className="activity-list">
        {activities.map((activity, i) => (
          <div key={i} className="activity-item">
            <div
              className="activity-avatar"
              style={{ background: colorMap[activity.color] }}
            >
              {iconMap[activity.type]}
            </div>
            <div className="activity-content">
              <div className="activity-text">
                <strong>{activity.user}</strong> · {activity.event}
              </div>
              <div className="activity-time">il y a {activity.time}</div>
            </div>
            <div className="activity-amount">{activity.amount}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
