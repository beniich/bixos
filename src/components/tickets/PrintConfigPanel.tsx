import React, { useState } from 'react'
import type { TicketDesign, PrintLayout, PaperSize, TicketFormat } from '../../types/ticket'

interface PrintConfigPanelProps {
  design: TicketDesign
  onChange: (design: TicketDesign) => void
  onSave?: (design: TicketDesign) => void
  ticketCount: number
  stats: { total: number; selected: number; valid: number; used: number }
  onSelectAll: () => void
  onDeselectAll: () => void
}

const FORMATS: Array<{ value: TicketFormat; label: string; icon: string; description: string }> = [
  { value: 'STANDARD', label: 'Standard', icon: '🎫', description: 'Billet complet A6' },
  { value: 'COMPACT', label: 'Compact', icon: '📱', description: 'Format réduit mobile' },
  { value: 'PREMIUM', label: 'Premium', icon: '✨', description: 'Design haut de gamme' },
  { value: 'BADGE', label: 'Badge', icon: '🏷️', description: 'Format badge 54x85mm' },
  { value: 'E_TICKET', label: 'E-Ticket', icon: '📧', description: 'Billet numérique' }
]

const PAPER_SIZES: Array<{ value: PaperSize; label: string; dimensions: string }> = [
  { value: 'A4', label: 'A4', dimensions: '210 × 297 mm' },
  { value: 'A5', label: 'A5', dimensions: '148 × 210 mm' },
  { value: 'LETTER', label: 'Letter US', dimensions: '216 × 279 mm' },
  { value: 'THERMAL_80MM', label: 'Thermique 80mm', dimensions: '80 mm' },
  { value: 'THERMAL_58MM', label: 'Thermique 58mm', dimensions: '58 mm' }
]

const LAYOUTS: Array<{ value: PrintLayout; label: string; description: string }> = [
  { value: 'SINGLE', label: '1 par page', description: 'Un billet par page A4' },
  { value: 'TWO_COLUMN', label: '2 par page', description: 'Deux billets par page A4' },
  { value: 'FOUR_GRID', label: '4 par page', description: 'Quatre billets par page A4' },
  { value: 'BADGE_SHEET', label: 'Planche badges', description: '10 badges A4' },
  { value: 'AVERY_5160', label: 'Avery 5160', description: '30 étiquettes par page' },
  { value: 'AVERY_5163', label: 'Avery 5163', description: '20 badges par page' }
]

const COLOR_PRESETS = [
  { name: 'Cyan', primary: '#00e5ff', accent: '#ff00aa' },
  { name: 'Or', primary: '#ffb800', accent: '#8b5cf6' },
  { name: 'Émeraude', primary: '#10b981', accent: '#00e5ff' },
  { name: 'Rouge', primary: '#ff3860', accent: '#ffb800' },
  { name: 'Violet', primary: '#8b5cf6', accent: '#00e5ff' },
  { name: 'Minuit', primary: '#1a2032', accent: '#00e5ff' }
]

const FIELD_LABELS: Record<string, string> = {
  eventTitle: 'Titre événement', eventDate: 'Date', eventTime: 'Heure',
  venueName: 'Nom du lieu', venueAddress: 'Adresse', seatRow: 'Rangée',
  seatNumber: 'Numéro siège', section: 'Section', category: 'Catégorie',
  ticketHolder: 'Nom détenteur', ticketType: 'Type billet', price: 'Prix',
  reference: 'Référence', gate: 'Porte d\'entrée'
}

const PrintConfigPanel: React.FC<PrintConfigPanelProps> = ({
  design, onChange, onSave, ticketCount, stats, onSelectAll, onDeselectAll
}) => {
  const [section, setSection] = useState<'format' | 'content' | 'style' | 'advanced'>('format')

  const update = <K extends keyof TicketDesign>(key: K, value: TicketDesign[K]) =>
    onChange({ ...design, [key]: value })

  const updateField = (key: keyof TicketDesign['fields']) =>
    onChange({ ...design, fields: { ...design.fields, [key]: !design.fields[key] } })

  const panelStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    color: '#e2e8f0',
    fontFamily: "'Inter', sans-serif",
    fontSize: 13
  }

  const navItem = (id: string, label: string, icon: string) => ({
    style: {
      flex: 1, padding: '6px 4px', border: 'none', borderRadius: 8,
      background: section === id ? 'rgba(0,229,255,0.15)' : 'transparent',
      color: section === id ? '#00e5ff' : 'rgba(255,255,255,0.5)',
      cursor: 'pointer', fontSize: 11, fontWeight: 600,
      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2
    }
  })

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>⚙ Configuration</h3>
        {onSave && (
          <button onClick={() => onSave(design)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', color: '#e2e8f0', cursor: 'pointer', fontSize: 12 }}>
            💾 Sauver
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[
          { value: stats.total, label: 'Total', color: 'rgba(255,255,255,0.6)' },
          { value: stats.selected, label: 'Sélect.', color: '#00e5ff' },
          { value: stats.valid, label: 'Valides', color: '#00ff88' },
          { value: stats.used, label: 'Utilisés', color: '#ffb800' }
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(0,0,0,0.3)', borderRadius: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onSelectAll} style={{ flex: 1, padding: '6px 8px', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 8, color: '#00e5ff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Tout sélect.</button>
        <button onClick={onDeselectAll} style={{ flex: 1, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 12 }}>Désélect.</button>
      </div>

      {/* Nav Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 4 }}>
        {[['format','Format','📐'], ['content','Contenu','📝'], ['style','Style','🎨'], ['advanced','Avancé','⚙']].map(([id, label, icon]) => (
          <button key={id} onClick={() => setSection(id as any)} {...navItem(id, label, icon)}>
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* === FORMAT === */}
      {section === 'format' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Format billet</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {FORMATS.map(f => (
                <button key={f.value} onClick={() => update('format', f.value)}
                  style={{ padding: '10px 8px', background: design.format === f.value ? 'rgba(0,229,255,0.15)' : 'rgba(0,0,0,0.2)', border: `1px solid ${design.format === f.value ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'center', color: design.format === f.value ? '#00e5ff' : 'rgba(255,255,255,0.7)' }}>
                  <div style={{ fontSize: 18 }}>{f.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{f.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Taille du papier</div>
            <select value={design.paperSize} onChange={(e) => update('paperSize', e.target.value as PaperSize)}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontSize: 13 }}>
              {PAPER_SIZES.map(p => (
                <option key={p.value} value={p.value}>{p.label} — {p.dimensions}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Mise en page</div>
            {LAYOUTS.map(l => (
              <button key={l.value} onClick={() => update('layout', l.value)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: design.layout === l.value ? 'rgba(0,229,255,0.1)' : 'transparent', border: `1px solid ${design.layout === l.value ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8, cursor: 'pointer', marginBottom: 4, color: design.layout === l.value ? '#00e5ff' : 'rgba(255,255,255,0.7)', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{l.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>{l.description}</div>
                </div>
                {design.layout === l.value && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === CONTENT === */}
      {section === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)' }}>Champs affichés</div>
          {Object.entries(design.fields).map(([key, val]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{FIELD_LABELS[key] || key}</span>
              <div onClick={() => updateField(key as keyof TicketDesign['fields'])}
                style={{ width: 36, height: 20, borderRadius: 10, background: val ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.3s', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', top: 2, left: val ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </div>
            </label>
          ))}

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Options affichage</div>
            {[
              { key: 'showQrCode', label: 'QR Code' },
              { key: 'showBarcode', label: 'Code-barres' },
              { key: 'showOrganizer', label: 'Organisateur' },
              { key: 'showTerms', label: 'Conditions' },
              { key: 'showRefundPolicy', label: 'Politique remboursement' },
              { key: 'showLogo', label: 'Logo' }
            ].map(opt => (
              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{opt.label}</span>
                <div onClick={() => update(opt.key as keyof TicketDesign, !design[opt.key as keyof TicketDesign])}
                  style={{ width: 36, height: 20, borderRadius: 10, background: design[opt.key as keyof TicketDesign] ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.3s', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: 2, left: design[opt.key as keyof TicketDesign] ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.3s' }} />
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* === STYLE === */}
      {section === 'style' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Présets de couleurs</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {COLOR_PRESETS.map(preset => (
                <button key={preset.name} onClick={() => onChange({ ...design, primaryColor: preset.primary, accentColor: preset.accent })}
                  style={{ padding: '8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: preset.primary }} />
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: preset.accent }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'primaryColor', label: 'Couleur primaire' },
            { key: 'accentColor', label: 'Couleur accent' },
            { key: 'backgroundColor', label: 'Fond billet' },
            { key: 'textColor', label: 'Couleur texte' }
          ].map(c => (
            <label key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{c.label}</span>
              <input type="color" value={design[c.key as keyof TicketDesign] as string}
                onChange={(e) => update(c.key as keyof TicketDesign, e.target.value)}
                style={{ width: 36, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }} />
            </label>
          ))}
        </div>
      )}

      {/* === ADVANCED === */}
      {section === 'advanced' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'holographicEffect', label: 'Effet hologramme' },
            { key: 'antiCopyCode', label: 'Code anti-copie' }
          ].map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{opt.label}</span>
              <div onClick={() => update(opt.key as keyof TicketDesign, !design[opt.key as keyof TicketDesign])}
                style={{ width: 36, height: 20, borderRadius: 10, background: design[opt.key as keyof TicketDesign] ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.3s', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', top: 2, left: design[opt.key as keyof TicketDesign] ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.3s' }} />
              </div>
            </label>
          ))}

          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Message personnalisé</div>
            <textarea value={design.customMessage || ''}
              onChange={(e) => update('customMessage', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontSize: 13, resize: 'vertical', minHeight: 80 }}
              placeholder="Message affiché au dos du billet..." />
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Filigrane</div>
            <input value={design.watermark || ''} onChange={(e) => update('watermark', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontSize: 13 }}
              placeholder="Ex: CONFIDENTIEL" />
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Taille QR Code: {design.qrSize}px</div>
            <input type="range" min="60" max="200" value={design.qrSize}
              onChange={(e) => update('qrSize', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#00e5ff' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default PrintConfigPanel
