import React from 'react'
import FormField from '../shared/FormField'
import TagInput from '../shared/TagInput'
import ImageDropzone from '../shared/ImageDropzone'

const EVENT_TYPES = [
  { value: 'concert', label: '🎵 Concert' },
  { value: 'theater', label: '🎭 Théâtre' },
  { value: 'sport', label: '⚽ Sport' },
  { value: 'festival', label: '🎪 Festival' },
  { value: 'conference', label: '💼 Conférence' },
  { value: 'expo', label: '🎨 Exposition' },
  { value: 'standup', label: '🎤 Stand-up' },
  { value: 'other', label: '✨ Autre' }
]

const COLORS = [
  '#00f0ff', '#b537f2', '#ff006e', '#00ff88',
  '#ffb800', '#ff3860', '#8b5cf6', '#10b981'
]

export default function Step1General({ data, update }) {
  const set = (field) => (value) => update({ ...data, [field]: value })

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">📋 Informations Générales</h2>
        <p className="step-subtitle">Décrivez l'événement pour attirer les spectateurs</p>
      </div>

      <div className="alert alert-info">
        <span>💡</span>
        <span>Soyez précis et accrocheur — un bon titre augmente les ventes de 35%.</span>
      </div>

      <div className="form-grid">
        <div className="form-grid-full">
          <FormField label="Titre de l'événement" required icon="✦">
            <div className="input-with-icon">
              <span className="input-icon">✦</span>
              <input className="form-input" value={data.title}
                onChange={(e) => set('title')(e.target.value)}
                placeholder="Ex: Festival Électro Summer 2024" maxLength="100" />
            </div>
          </FormField>
        </div>

        <div className="form-grid-full">
          <FormField label="Sous-titre" hint="Une ligne pour compléter le titre">
            <input className="form-input" value={data.subtitle}
              onChange={(e) => set('subtitle')(e.target.value)}
              placeholder="Ex: 3 jours de musique électronique en plein air" maxLength="150" />
          </FormField>
        </div>

        <FormField label="Type d'événement" required>
          <select className="form-select" value={data.type}
            onChange={(e) => set('type')(e.target.value)}>
            {EVENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Catégorie" required>
          <select className="form-select" value={data.category}
            onChange={(e) => set('category')(e.target.value)}>
            <option value="">— Sélectionner —</option>
            <option value="musique">🎵 Musique</option>
            <option value="culture">🎭 Culture</option>
            <option value="sport">⚽ Sport</option>
            <option value="loisirs">🎨 Loisirs</option>
          </select>
        </FormField>

        <div className="form-grid-full">
          <FormField label="Description complète" required>
            <textarea className="form-textarea" value={data.description}
              onChange={(e) => set('description')(e.target.value)}
              placeholder="Présentez votre événement en détail : programme, ambiance, dress code..."
              rows="6" />
          </FormField>
        </div>

        <div className="form-grid-full">
          <FormField label="Tags" hint="Appuyez sur Entrée pour ajouter">
            <TagInput tags={data.tags || []} onChange={set('tags')}
              placeholder="Ex: electro, été, outdoor..." maxTags={10} />
          </FormField>
        </div>

        <div className="form-grid-full">
          <FormField label="Couleur de l'événement" hint="Personnalisez la charte graphique">
            <div className="color-options">
              {COLORS.map(c => (
                <div key={c}
                  className={`color-option ${data.color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color')(c)} />
              ))}
            </div>
          </FormField>
        </div>
      </div>
    </div>
  )
}
