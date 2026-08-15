import React from 'react'
import FormField from '../shared/FormField'

const VENUES = [
  { id: 1, name: '🎭 Opéra Garnier', city: 'Paris', capacity: 1979 },
  { id: 2, name: '⚽ Stade de France', city: 'Saint-Denis', capacity: 81338 },
  { id: 3, name: "🎵 L'Olympia", city: 'Paris', capacity: 2000 },
  { id: 4, name: '🎪 Bercy', city: 'Paris', capacity: 20300 },
  { id: 5, name: '🎭 Comédie-Française', city: 'Paris', capacity: 862 }
]

export default function Step2DateLocation({ data, update }) {
  const set = (field) => (value) => update({ ...data, [field]: value })

  const duration = data.startDate && data.endDate
    ? Math.round((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24))
    : 0

  const updateDatePart = (field, part, value) => {
    const current = data[field] || ''
    const [datePart, timePart] = current.split('T')
    if (part === 'date') set(field)(value + 'T' + (timePart || '20:00'))
    if (part === 'time') set(field)((datePart || '') + 'T' + value)
  }

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">📅 Date & Lieu</h2>
        <p className="step-subtitle">Quand et où se déroule l'événement</p>
      </div>

      <div className="form-grid">
        <FormField label="Date de début" required>
          <div className="date-time-grid">
            <div className="date-time-block">
              <span className="date-time-label">📅 Date</span>
              <input type="date" className="form-input"
                value={data.startDate?.split('T')[0] || ''}
                onChange={(e) => updateDatePart('startDate', 'date', e.target.value)} />
            </div>
            <div className="date-time-block">
              <span className="date-time-label">🕐 Heure</span>
              <input type="time" className="form-input"
                value={data.startDate?.split('T')[1] || '20:00'}
                onChange={(e) => updateDatePart('startDate', 'time', e.target.value)} />
            </div>
          </div>
        </FormField>

        <FormField label="Date de fin" required>
          <div className="date-time-grid">
            <div className="date-time-block">
              <span className="date-time-label">📅 Date</span>
              <input type="date" className="form-input"
                value={data.endDate?.split('T')[0] || ''}
                onChange={(e) => updateDatePart('endDate', 'date', e.target.value)} />
            </div>
            <div className="date-time-block">
              <span className="date-time-label">🕐 Heure</span>
              <input type="time" className="form-input"
                value={data.endDate?.split('T')[1] || '23:00'}
                onChange={(e) => updateDatePart('endDate', 'time', e.target.value)} />
            </div>
          </div>
        </FormField>
      </div>

      {duration > 0 && (
        <div className="alert alert-info">
          <span>⏱</span>
          <span>Durée : <strong>{duration} jour{duration > 1 ? 's' : ''}</strong></span>
        </div>
      )}

      <div className="form-grid" style={{ marginTop: 24 }}>
        <div className="form-grid-full">
          <FormField label="Lieu de l'événement" required>
            <select className="form-select" value={data.venueId}
              onChange={(e) => set('venueId')(e.target.value)}>
              <option value="">— Choisir un lieu —</option>
              {VENUES.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.city} ({v.capacity.toLocaleString()} places)
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Capacité totale" required hint="Nombre max de spectateurs">
          <input type="number" className="form-input" value={data.capacity}
            onChange={(e) => set('capacity')(e.target.value)}
            placeholder="Ex: 500" min="1" />
        </FormField>

        <FormField label="Âge minimum" hint="Restriction d'accès">
          <select className="form-select" value={data.minAge}
            onChange={(e) => set('minAge')(e.target.value)}>
            <option value="0">Tous publics</option>
            <option value="12">-12 ans accompagnés</option>
            <option value="16">-16 ans accompagnés</option>
            <option value="18">Interdit aux -18 ans</option>
          </select>
        </FormField>

        <div className="form-grid-full">
          <FormField label="Adresse complète" hint="Si différente du lieu principal">
            <input className="form-input" value={data.address}
              onChange={(e) => set('address')(e.target.value)}
              placeholder="Ex: 1 Place de l'Opéra, 75009 Paris" />
          </FormField>
        </div>

        <div className="form-grid-full">
          <FormField label="Informations d'accès" hint="Transports, parking, itinéraires">
            <textarea className="form-textarea" value={data.accessInfo}
              onChange={(e) => set('accessInfo')(e.target.value)}
              placeholder="Métro Opéra (lignes 3, 7, 8). Parking Indigo à 50m..."
              rows="3" />
          </FormField>
        </div>
      </div>
    </div>
  )
}
