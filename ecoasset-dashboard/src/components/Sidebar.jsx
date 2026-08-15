import React, { useState } from 'react'

export default function Sidebar() {
  const [active, setActive] = useState('dashboard')

  const sections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', icon: '◈', label: 'Dashboard', badge: null },
        { id: 'events', icon: '◆', label: 'Événements', badge: '12' },
        { id: 'bookings', icon: '✦', label: 'Réservations', badge: null },
        { id: 'analytics', icon: '◇', label: 'Analytics', badge: 'NEW' }
      ]
    },
    {
      title: 'Gestion',
      items: [
        { id: 'venues', icon: '⬢', label: 'Lieux', badge: null },
        { id: 'speakers', icon: '◉', label: 'Artistes', badge: null },
        { id: 'tickets', icon: '⬡', label: 'Billets', badge: null },
        { id: 'promo', icon: '◐', label: 'Promotions', badge: null }
      ]
    },
    {
      title: 'Communauté',
      items: [
        { id: 'users', icon: '◍', label: 'Utilisateurs', badge: null },
        { id: 'reviews', icon: '✧', label: 'Avis', badge: '5' },
        { id: 'loyalty', icon: '◈', label: 'Fidélité', badge: null }
      ]
    },
    {
      title: 'Système',
      items: [
        { id: 'notifications', icon: '◉', label: 'Notifications', badge: '8' },
        { id: 'settings', icon: '✦', label: 'Paramètres', badge: null }
      ]
    }
  ]

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">E</div>
        <div className="logo-text">ECOASSET</div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="nav-section">
          <div className="nav-title">{section.title}</div>
          {section.items.map((item) => (
            <a
              key={item.id}
              className={`nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </a>
          ))}
        </div>
      ))}
    </aside>
  )
}
