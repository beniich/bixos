import React from 'react'

export default function ToggleSwitch({ active, onChange, title, description }) {
  return (
    <div className="toggle-wrapper">
      <div className="toggle-label">
        <span className="toggle-title">{title}</span>
        {description && <span className="toggle-desc">{description}</span>}
      </div>
      <div
        className={`toggle-switch ${active ? 'active' : ''}`}
        onClick={() => onChange(!active)}
      >
        <div className="toggle-knob"></div>
      </div>
    </div>
  )
}
