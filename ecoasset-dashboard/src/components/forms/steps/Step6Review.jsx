import React from 'react'

export default function Step6Review({ data }) {
  const { step1, step2, step3 } = data

  const totalTickets = (step3?.tickets || []).reduce((s, t) => s + (parseInt(t.quantity) || 0), 0)
  const minPrice = (step3?.tickets || []).reduce((min, t) => {
    const p = parseFloat(t.price)
    return (!isNaN(p) && p < min) ? p : min
  }, Infinity)

  const sections = [
    {
      icon: '📋',
      label: 'Événement',
      content: [
        { key: 'Titre', value: step1?.title || '—' },
        { key: 'Type', value: step1?.type || '—' },
        { key: 'Catégorie', value: step1?.category || '—' },
        { key: 'Tags', value: (step1?.tags || []).join(', ') || '—' },
      ]
    },
    {
      icon: '📅',
      label: 'Date & Lieu',
      content: [
        { key: 'Début', value: step2?.startDate ? new Date(step2.startDate).toLocaleString('fr-FR') : '—' },
        { key: 'Fin', value: step2?.endDate ? new Date(step2.endDate).toLocaleString('fr-FR') : '—' },
        { key: 'Lieu', value: step2?.venueId || '—' },
        { key: 'Capacité', value: step2?.capacity ? `${step2.capacity} personnes` : '—' },
      ]
    },
    {
      icon: '🎫',
      label: 'Billets',
      content: [
        { key: 'Types de billets', value: `${(step3?.tickets || []).length}` },
        { key: 'Stock total', value: totalTickets.toLocaleString() },
        { key: 'Prix à partir de', value: isFinite(minPrice) ? `${minPrice}€` : '—' },
      ]
    }
  ]

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">✅ Récapitulatif</h2>
        <p className="step-subtitle">Vérifiez toutes les informations avant de publier</p>
      </div>

      <div className="alert alert-warning">
        <span>⚠</span>
        <span>Relisez attentivement chaque section. Ces informations seront visibles par les acheteurs.</span>
      </div>

      {data.step4?.coverImage && (
        <div className="review-image"
          style={{ backgroundImage: `url(${data.step4.coverImage.preview})`, marginBottom: 20 }} />
      )}

      <div className="review-summary">
        {sections.map((section) => (
          <div key={section.label} className="review-section">
            <div className="review-section-label">
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </div>
            <div className="review-section-content">
              {section.content.map((item) => (
                <div key={item.key} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: 12, minWidth: 140 }}>{item.key}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(step3?.tickets || []).length > 0 && (
          <div className="review-section" style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {step3.tickets.map((t, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 12,
                  border: '1px solid var(--glass-border)',
                  minWidth: 160
                }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase' }}>
                    {t.tier}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name || `Type ${i + 1}`}</div>
                  <div style={{ color: 'var(--primary)', fontFamily: 'Orbitron', marginTop: 4 }}>
                    {t.price || 0}€
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                    {t.quantity || 0} places
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="alert alert-success" style={{ marginTop: 24 }}>
        <span>🚀</span>
        <span>Tout est prêt ! Cliquez sur <strong>Publier l'événement</strong> pour le mettre en ligne.</span>
      </div>
    </div>
  )
}
