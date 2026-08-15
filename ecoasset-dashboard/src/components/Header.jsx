import React from 'react'

export default function Header() {
  return (
    <header className="header glass">
      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input type="text" placeholder="Rechercher un événement, utilisateur, réservation..." />
      </div>

      <div className="header-actions">
        <button className="icon-btn" title="Thème">
          ☼
        </button>
        <button className="icon-btn" title="Messages">
          ✉
          <span className="notif-dot"></span>
        </button>
        <button className="icon-btn" title="Notifications">
          ◉
          <span className="notif-dot"></span>
        </button>
        <div className="avatar" title="Mon profil">JD</div>
      </div>
    </header>
  )
}
