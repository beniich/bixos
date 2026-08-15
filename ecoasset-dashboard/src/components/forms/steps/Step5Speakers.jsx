import React from 'react'
import FormField from '../shared/FormField'

const DEFAULT_SPEAKER = {
  name: '', role: '', bio: '', photo: null,
  social: { twitter: '', instagram: '', website: '' }
}

export default function Step5Speakers({ data, update }) {
  const set = (field) => (value) => update({ ...data, [field]: value })

  const addSpeaker = () => set('speakers')([...(data.speakers || []), { ...DEFAULT_SPEAKER }])

  const updateSpeaker = (i, value) => {
    const speakers = [...(data.speakers || [])]
    speakers[i] = value
    set('speakers')(speakers)
  }

  const removeSpeaker = (i) => set('speakers')((data.speakers || []).filter((_, idx) => idx !== i))

  const handlePhoto = (i, file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const speakers = [...(data.speakers || [])]
      speakers[i] = { ...speakers[i], photo: e.target.result }
      set('speakers')(speakers)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">🎤 Artistes & Intervenants</h2>
        <p className="step-subtitle">Présentez les talents qui animeront l'événement</p>
      </div>

      <div className="alert alert-info">
        <span>ℹ</span>
        <span>Cette étape est optionnelle. Vous pouvez l'ignorer si l'événement n'a pas d'artistes.</span>
      </div>

      {(data.speakers || []).map((speaker, i) => (
        <div key={i} className="speaker-card-form">
          <div
            className="speaker-avatar-upload"
            style={speaker.photo ? { backgroundImage: `url(${speaker.photo})` } : {}}
            onClick={() => document.getElementById(`speaker-${i}`)?.click()}
          >
            {!speaker.photo && '📷'}
            <input id={`speaker-${i}`} type="file" accept="image/*"
              onChange={(e) => handlePhoto(i, e.target.files[0])} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: 14 }}>Intervenant #{i + 1}</strong>
              <button type="button" className="btn-remove-ticket" onClick={() => removeSpeaker(i)}>✕</button>
            </div>

            <div className="form-grid">
              <FormField label="Nom" required>
                <input className="form-input" value={speaker.name}
                  onChange={(e) => updateSpeaker(i, { ...speaker, name: e.target.value })}
                  placeholder="Ex: Daft Punk" />
              </FormField>
              <FormField label="Rôle" required>
                <input className="form-input" value={speaker.role}
                  onChange={(e) => updateSpeaker(i, { ...speaker, role: e.target.value })}
                  placeholder="Ex: DJ, Artiste principal..." />
              </FormField>
              <div className="form-grid-full">
                <FormField label="Bio courte">
                  <textarea className="form-textarea" value={speaker.bio}
                    onChange={(e) => updateSpeaker(i, { ...speaker, bio: e.target.value })}
                    placeholder="Quelques lignes de présentation..." rows="3" />
                </FormField>
              </div>
              <FormField label="Twitter / X">
                <div className="input-with-icon">
                  <span className="input-icon">𝕏</span>
                  <input className="form-input" value={speaker.social?.twitter || ''}
                    onChange={(e) => updateSpeaker(i, { ...speaker, social: { ...speaker.social, twitter: e.target.value } })}
                    placeholder="@username" />
                </div>
              </FormField>
              <FormField label="Instagram">
                <div className="input-with-icon">
                  <span className="input-icon">📸</span>
                  <input className="form-input" value={speaker.social?.instagram || ''}
                    onChange={(e) => updateSpeaker(i, { ...speaker, social: { ...speaker.social, instagram: e.target.value } })}
                    placeholder="@username" />
                </div>
              </FormField>
            </div>
          </div>
        </div>
      ))}

      <button className="add-ticket-btn" onClick={addSpeaker} type="button">
        <span style={{ fontSize: 18 }}>+</span>
        <span>Ajouter un artiste / intervenant</span>
      </button>
    </div>
  )
}
