import React, { useState } from 'react'
import Step1General from './steps/Step1General'
import Step2DateLocation from './steps/Step2DateLocation'
import Step3Tickets from './steps/Step3Tickets'
import Step4Media from './steps/Step4Media'
import Step5Speakers from './steps/Step5Speakers'
import Step6Review from './steps/Step6Review'

const STEPS = [
  { id: 1, label: 'Général', icon: '📋' },
  { id: 2, label: 'Date & Lieu', icon: '📅' },
  { id: 3, label: 'Billets', icon: '🎫' },
  { id: 4, label: 'Médias', icon: '🖼️' },
  { id: 5, label: 'Artistes', icon: '🎤' },
  { id: 6, label: 'Récap', icon: '✅' },
]

const INITIAL = {
  step1: { title: '', subtitle: '', type: 'concert', category: '', description: '', tags: [], color: '#00f0ff' },
  step2: { startDate: '', endDate: '', venueId: '', capacity: '', minAge: '0', address: '', accessInfo: '' },
  step3: { tickets: [] },
  step4: { coverImage: null, gallery: [], videoUrl: '', terms: '' },
  step5: { speakers: [] },
}

export default function EventForm({ onClose }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (stepKey) => (value) => setData(d => ({ ...d, [stepKey]: value }))

  const next = () => step < STEPS.length && setStep(s => s + 1)
  const prev = () => step > 1 && setStep(s => s - 1)

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="form-container">
        <div className="glass form-card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <h2 className="step-title" style={{ textAlign: 'center', marginBottom: 16 }}>
            Événement Publié !
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
            Votre événement est maintenant en ligne et visible par les spectateurs.
          </p>
          <button className="btn btn-primary" onClick={() => { setData(INITIAL); setStep(1); setSubmitted(false) }}>
            ◈ Créer un nouvel événement
          </button>
        </div>
      </div>
    )
  }

  const progressWidth = `${((step - 1) / (STEPS.length - 1)) * 85}%`

  return (
    <div className="form-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 24, marginBottom: 4 }}>◈ CRÉER UN ÉVÉNEMENT</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Étape {step} sur {STEPS.length}</p>
        </div>
        {onClose && (
          <button className="btn btn-ghost" onClick={onClose}>✕ Annuler</button>
        )}
      </div>

      <div className="glass form-card">
        {/* Progress */}
        <div className="form-progress" style={{ '--progress-width': progressWidth }}>
          <div className="form-progress-line" style={{
            position: 'absolute', top: 24, left: 24, height: 2,
            width: progressWidth, background: 'var(--grad-primary)',
            zIndex: 1, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 10px var(--primary)'
          }} />
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`progress-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}
              onClick={() => step > s.id && setStep(s.id)}
            >
              <div className="progress-circle">
                {step > s.id ? '✓' : s.icon}
              </div>
              <span className="progress-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{ minHeight: 400 }}>
          {step === 1 && <Step1General data={data.step1} update={update('step1')} />}
          {step === 2 && <Step2DateLocation data={data.step2} update={update('step2')} />}
          {step === 3 && <Step3Tickets data={data.step3} update={update('step3')} />}
          {step === 4 && <Step4Media data={data.step4} update={update('step4')} />}
          {step === 5 && <Step5Speakers data={data.step5} update={update('step5')} />}
          {step === 6 && <Step6Review data={data} />}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={prev} disabled={step === 1}>
            ← Précédent
          </button>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              {step}/{STEPS.length}
            </span>
            {step < STEPS.length ? (
              <button className="btn btn-primary" onClick={next}>
                Suivant →
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <><span className="btn-loader" /> Publication...</>
                ) : (
                  <>🚀 Publier l'événement</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
