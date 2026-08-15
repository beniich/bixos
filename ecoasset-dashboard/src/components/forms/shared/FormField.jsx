import React from 'react'

export default function FormField({ label, required, icon, error, hint, children }) {
  return (
    <div className="form-field">
      {label && (
        <label className="form-label">
          {icon && <span className="icon">{icon}</span>}
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && (
        <span className="form-error">
          <span>⚠</span> {error}
        </span>
      )}
    </div>
  )
}
