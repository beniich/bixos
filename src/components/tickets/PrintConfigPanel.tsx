import React, { useState } from 'react'
import type { TicketDesign, PrintLayout, PaperSize, TicketFormat } from '../../types/ticket'

interface PrintConfigPanelProps {
  design: TicketDesign
  onChange: (design: TicketDesign) => void
  onSave?: (design: TicketDesign) => void
  ticketCount: number
  stats: {
    total: number
    selected: number
    valid: number
    used: number
  }
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
  { value: 'BADGE_SHEET', label: 'Planche badges', description: '10 badges A4 (54×85mm)' },
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

const PrintConfigPanel: React.FC<PrintConfigPanelProps> = ({
  design,
  onChange,
  onSave,
  ticketCount,
  stats,
  onSelectAll,
  onDeselectAll
}) => {
  const [section, setSection] = useState<'format' | 'content' | 'style' | 'advanced'>('format')

  const update = <K extends keyof TicketDesign>(key: K, value: TicketDesign[K]) => {
    onChange({ ...design, [key]: value })
  }

  const updateField = (key: keyof TicketDesign['fields']) => {
    onChange({
      ...design,
      fields: { ...design.fields, [key]: !design.fields[key] }
    })
  }

  return (
    <div className="print-config-panel">
      <div className="print-config-header">
        <h3>⚙ Configuration</h3>
        {onSave && (
          <button
            className="bizos-btn bizos-btn-ghost bizos-btn-sm"
            onClick={() => onSave(design)}
            title="Sauvegarder comme modèle"
          >
            💾 Sauvegarder
          </button>
        )}
      </div>

      {/* Stats rapides */}
      <div className="print-config-stats">
        <div className="print-stat">
          <div className="print-stat-value">{stats.total}</div>
          <div className="print-stat-label">Total</div>
        </div>
        <div className="print-stat primary">
          <div className="print-stat-value">{stats.selected}</div>
          <div className="print-stat-label">Sélectionnés</div>
        </div>
        <div className="print-stat success">
          <div className="print-stat-value">{stats.valid}</div>
          <div className="print-stat-label">Valides</div>
        </div>
        <div className="print-stat warning">
          <div className="print-stat-value">{stats.used}</div>
          <div className="print-stat-label">Utilisés</div>
        </div>
      </div>

      <div className="print-config-actions">
        <button className="bizos-btn bizos-btn-secondary bizos-btn-sm" onClick={onSelectAll}>
          Tout sélectionner
        </button>
        <button className="bizos-btn bizos-btn-ghost bizos-btn-sm" onClick={onDeselectAll}>
          Tout désélectionner
        </button>
      </div>

      {/* Navigation sections */}
      <div className="print-config-nav">
        {[
          { id: 'format', label: 'Format', icon: '📐' },
          { id: 'content', label: 'Contenu', icon: '📝' },
          { id: 'style', label: 'Style', icon: '🎨' },
          { id: 'advanced', label: 'Avancé', icon: '⚙' }
        ].map(s => (
          <button
            key={s.id}
            className={`print-config-nav-item ${section === s.id ? 'active' : ''}`}
            onClick={() => setSection(s.id as any)}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="print-config-content">
        {/* === SECTION FORMAT === */}
        {section === 'format' && (
          <div className="config-section">
            <div className="config-group">
              <label>Format du billet</label>
              <div className="format-grid">
                {FORMATS.map(format => (
                  <button
                    key={format.value}
                    className={`format-option ${design.format === format.value ? 'active' : ''}`}
                    onClick={() => update('format', format.value)}
                  >
                    <span className="format-icon">{format.icon}</span>
                    <span className="format-label">{format.label}</span>
                    <span className="format-desc">{format.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="config-group">
              <label>Taille du papier</label>
              <select
                className="bizos-field-select"
                value={design.paperSize}
                onChange={(e) => update('paperSize', e.target.value as PaperSize)}
              >
                {PAPER_SIZES.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label} ({size.dimensions})
                  </option>
                ))}
              </select>
            </div>

            <div className="config-group">
              <label>Mise en page</label>
              <div className="layout-grid">
                {LAYOUTS.map(layout => (
                  <button
                    key={layout.value}
                    className={`layout-option ${design.layout === layout.value ? 'active' : ''}`}
                    onClick={() => update('layout', layout.value)}
                  >
                    <div className="layout-preview">
                      {layout.value === 'SINGLE' && <div className="layout-cell single" />}
                      {layout.value === 'TWO_COLUMN' && (
                        <>
                          <div className="layout-cell half" />
                          <div className="layout-cell half" />
                        </>
                      )}
                      {layout.value === 'FOUR_GRID' && (
                        <>
                          <div className="layout-cell quarter" />
                          <div className="layout-cell quarter" />
                          <div className="layout-cell quarter" />
                          <div className="layout-cell quarter" />
                        </>
                      )}
                      {layout.value === 'BADGE_SHEET' && (
                        <div className="layout-cell badge-sheet">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="badge-cell" />
                          ))}
                        </div>
                      )}
                      {layout.value === 'AVERY_5160' && (
                        <div className="layout-cell avery-5160">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="avery-5160-cell" />
                          ))}
                        </div>
                      )}
                      {layout.value === 'AVERY_5163' && (
                        <div className="layout-cell avery-5163">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="avery-5163-cell" />
                          ))}
                        </div>
                      )}
                    </div>
                    <span>{layout.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="config-group">
              <label>Orientation</label>
              <div className="orientation-toggle">
                <button
                  className={design.orientation === 'portrait' ? 'active' : ''}
                  onClick={() => update('orientation', 'portrait')}
                >
                  📱 Portrait
                </button>
                <button
                  className={design.orientation === 'landscape' ? 'active' : ''}
                  onClick={() => update('orientation', 'landscape')}
                >
                  📺 Paysage
                </button>
              </div>
            </div>

            <div className="config-group-row">
              <div className="config-group">
                <label>Marges (mm)</label>
                <input
                  type="number"
                  className="bizos-field-input"
                  value={design.marginMm}
                  onChange={(e) => update('marginMm', parseInt(e.target.value) || 0)}
                  min="0"
                  max="50"
                />
              </div>
              <div className="config-group">
                <label>Espacement (mm)</label>
                <input
                  type="number"
                  className="bizos-field-input"
                  value={design.spacingMm}
                  onChange={(e) => update('spacingMm', parseInt(e.target.value) || 0)}
                  min="0"
                  max="20"
                />
              </div>
            </div>
          </div>
        )}

        {/* === SECTION CONTENU === */}
        {section === 'content' && (
          <div className="config-section">
            <div className="config-group">
              <label>Champs affichés</label>
              <div className="fields-grid">
                {Object.entries({
                  eventTitle: 'Titre événement',
                  eventDate: 'Date',
                  eventTime: 'Heure',
                  venueName: 'Nom du lieu',
                  venueAddress: 'Adresse',
                  section: 'Section',
                  seatRow: 'Rangée',
                  seatNumber: 'Numéro siège',
                  category: 'Catégorie',
                  ticketHolder: 'Détenteur',
                  ticketType: 'Type de billet',
                  price: 'Prix',
                  reference: 'Référence',
                  gate: 'Porte'
                }).map(([key, label]) => (
                  <label key={key} className="field-toggle">
                    <input
                      type="checkbox"
                      checked={design.fields[key as keyof TicketDesign['fields']]}
                      onChange={() => updateField(key as keyof TicketDesign['fields'])}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="config-group">
              <label>Options d'affichage</label>
              <div className="toggle-list">
                <ToggleRow
                  label="QR Code"
                  description="Afficher le QR code d'entrée"
                  checked={design.showQrCode}
                  onChange={(v) => update('showQrCode', v)}
                />
                <ToggleRow
                  label="Code-barres"
                  description="Afficher code-barres 1D"
                  checked={design.showBarcode}
                  onChange={(v) => update('showBarcode', v)}
                />
                <ToggleRow
                  label="Logo événement"
                  description="Afficher logo ou nom organisateur"
                  checked={design.showEventLogo}
                  onChange={(v) => update('showEventLogo', v)}
                />
                <ToggleRow
                  label="Organisateur"
                  description="Afficher le nom de l'organisateur"
                  checked={design.showOrganizer}
                  onChange={(v) => update('showOrganizer', v)}
                />
                <ToggleRow
                  label="Conditions"
                  description="Afficher les CGV"
                  checked={design.showTerms}
                  onChange={(v) => update('showTerms', v)}
                />
                <ToggleRow
                  label="Politique remboursement"
                  description="Afficher la politique de remboursement"
                  checked={design.showRefundPolicy}
                  onChange={(v) => update('showRefundPolicy', v)}
                />
                <ToggleRow
                  label="Plan de salle"
                  description="Mini carte de la section"
                  checked={design.showSeatMap}
                  onChange={(v) => update('showSeatMap', v)}
                />
                <ToggleRow
                  label="Logo organisateur"
                  description="Afficher logo custom"
                  checked={design.showLogo}
                  onChange={(v) => update('showLogo', v)}
                />
              </div>
            </div>

            <div className="config-group">
              <label>Message personnalisé</label>
              <textarea
                className="bizos-field-textarea"
                value={design.customMessage || ''}
                onChange={(e) => update('customMessage', e.target.value)}
                placeholder="Ex: Présentez ce billet 30 min avant le début"
                rows={3}
              />
            </div>

            <div className="config-group">
              <label>Watermark</label>
              <input
                type="text"
                className="bizos-field-input"
                value={design.watermark || ''}
                onChange={(e) => update('watermark', e.target.value)}
                placeholder="Ex: ORIGINAL, NON REMBOURSABLE..."
                maxLength={30}
              />
            </div>
          </div>
        )}

        {/* === SECTION STYLE === */}
        {section === 'style' && (
          <div className="config-section">
            <div className="config-group">
              <label>Thèmes prédéfinis</label>
              <div className="theme-presets">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    className="theme-preset"
                    onClick={() => {
                      onChange({
                        ...design,
                        primaryColor: preset.primary,
                        accentColor: preset.accent
                      })
                    }}
                  >
                    <div
                      className="theme-preset-preview"
                      style={{
                        background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})`
                      }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="config-group-row">
              <div className="config-group">
                <label>Couleur primaire</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={design.primaryColor}
                    onChange={(e) => update('primaryColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="bizos-field-input"
                    value={design.primaryColor}
                    onChange={(e) => update('primaryColor', e.target.value)}
                  />
                </div>
              </div>
              <div className="config-group">
                <label>Couleur accent</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={design.accentColor}
                    onChange={(e) => update('accentColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="bizos-field-input"
                    value={design.accentColor}
                    onChange={(e) => update('accentColor', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="config-group-row">
              <div className="config-group">
                <label>Couleur fond</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={design.backgroundColor}
                    onChange={(e) => update('backgroundColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="bizos-field-input"
                    value={design.backgroundColor}
                    onChange={(e) => update('backgroundColor', e.target.value)}
                  />
                </div>
              </div>
              <div className="config-group">
                <label>Couleur texte</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={design.textColor}
                    onChange={(e) => update('textColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="bizos-field-input"
                    value={design.textColor}
                    onChange={(e) => update('textColor', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="config-group-row">
              <div className="config-group">
                <label>Couleur secondaire</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={design.secondaryColor}
                    onChange={(e) => update('secondaryColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="bizos-field-input"
                    value={design.secondaryColor}
                    onChange={(e) => update('secondaryColor', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="config-group">
              <label>Logo personnalisé (URL ou upload)</label>
              <div className="logo-upload">
                {design.logoUrl ? (
                  <div className="logo-preview">
                    <img src={design.logoUrl} alt="Logo" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button
                        className="bizos-btn bizos-btn-ghost bizos-btn-sm"
                        onClick={() => update('logoUrl', undefined)}
                      >
                        ✕ Retirer
                      </button>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                        Logo chargé
                      </span>
                    </div>
                  </div>
                ) : (
                  <label className="logo-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (ev) => update('logoUrl', ev.target?.result as string)
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    <span>📁 Choisir un logo (PNG/JPG, max 2MB)</span>
                  </label>
                )}
              </div>
              <small className="config-hint">
                Recommandé : PNG transparent, 300×100px max
              </small>
            </div>
          </div>
        )}

        {/* === SECTION AVANCÉ === */}
        {section === 'advanced' && (
          <div className="config-section">
            <div className="config-group">
              <label>Sécurité</label>
              <div className="toggle-list">
                <ToggleRow
                  label="Effet holographique"
                  description="Ajoute un effet visuel anti-contrefaçon sur le recto"
                  checked={design.holographicEffect}
                  onChange={(v) => update('holographicEffect', v)}
                />
                <ToggleRow
                  label="Code anti-copie"
                  description="Signature cryptographique visible sur le billet"
                  checked={design.antiCopyCode}
                  onChange={(v) => update('antiCopyCode', v)}
                />
              </div>
            </div>

            <div className="config-group">
              <label>
                Taille du QR Code
                <span style={{ marginLeft: 8, color: 'var(--neon-cyan)' }}>
                  {design.qrSize}px
                </span>
              </label>
              <input
                type="range"
                min="60"
                max="200"
                value={design.qrSize}
                onChange={(e) => update('qrSize', parseInt(e.target.value))}
                className="bizos-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)' }}>
                <span>Petit (60px)</span>
                <span>Moyen (130px)</span>
                <span>Grand (200px)</span>
              </div>
            </div>

            <div className="config-group">
              <label>Statistiques de génération</label>
              <div className="config-stats-card">
                <div className="config-stat">
                  <span>Billets sélectionnés</span>
                  <strong>{ticketCount}</strong>
                </div>
                <div className="config-stat">
                  <span>Pages estimées</span>
                  <strong>
                    {Math.max(1, Math.ceil(ticketCount / getTicketsPerPage(design.layout)))}
                  </strong>
                </div>
                <div className="config-stat">
                  <span>Taille PDF estimée</span>
                  <strong>~{Math.max(0.1, (ticketCount * 0.15)).toFixed(2)} MB</strong>
                </div>
                <div className="config-stat">
                  <span>Coût papier (estimé)</span>
                  <strong>~{Math.ceil(ticketCount / getTicketsPerPage(design.layout))} feuilles</strong>
                </div>
              </div>
            </div>

            <div className="config-group">
              <label>Actions rapides</label>
              <div className="config-quick-actions">
                <button
                  className="bizos-btn bizos-btn-secondary bizos-btn-sm"
                  onClick={() => {
                    onChange({
                      ...design,
                      format: 'STANDARD',
                      layout: 'TWO_COLUMN',
                      paperSize: 'A4',
                      orientation: 'portrait'
                    })
                  }}
                >
                  🔄 Reset aux défauts
                </button>
                <button
                  className="bizos-btn bizos-btn-secondary bizos-btn-sm"
                  onClick={() => {
                    const json = JSON.stringify(design, null, 2)
                    const blob = new Blob([json], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `design-${Date.now()}.json`
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  📥 Exporter design (JSON)
                </button>
                <label className="bizos-btn bizos-btn-secondary bizos-btn-sm">
                  📤 Importer design
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          try {
                            const imported = JSON.parse(ev.target?.result as string)
                            onChange({ ...DEFAULT_DESIGN, ...imported })
                          } catch {
                            alert('Fichier invalide')
                          }
                        }
                        reader.readAsText(file)
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const getTicketsPerPage = (layout: PrintLayout): number => {
  const map: Record<PrintLayout, number> = {
    SINGLE: 1,
    TWO_COLUMN: 2,
    FOUR_GRID: 4,
    BADGE_SHEET: 10,
    AVERY_5160: 30,
    AVERY_5163: 20
  }
  return map[layout] || 1
}

const ToggleRow: React.FC<{
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}> = ({ label, description, checked, onChange }) => (
  <div className="toggle-row">
    <div className="toggle-row-text">
      <strong>{label}</strong>
      <small>{description}</small>
    </div>
    <div
      className={`bizos-toggle-switch ${checked ? 'active' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="bizos-toggle-knob" />
    </div>
  </div>
)

// Export du DEFAULT_DESIGN pour réutilisation dans Advanced section
const DEFAULT_DESIGN: TicketDesign = {
  format: 'STANDARD',
  paperSize: 'A4',
  layout: 'TWO_COLUMN',
  orientation: 'portrait',
  marginMm: 10,
  spacingMm: 5,
  showLogo: true,
  primaryColor: '#00e5ff',
  secondaryColor: '#0a0e1a',
  accentColor: '#ff00aa',
  backgroundColor: '#ffffff',
  textColor: '#0a0e1a',
  showQrCode: true,
  qrSize: 120,
  showBarcode: false,
  showSeatMap: false,
  showEventLogo: true,
  showOrganizer: true,
  showTerms: true,
  showRefundPolicy: true,
  customMessage: 'Présentez ce billet à l\'entrée. Billet non remboursable.',
  fields: {
    eventTitle: true,
    eventDate: true,
    eventTime: true,
    venueName: true,
    venueAddress: true,
    seatRow: true,
    seatNumber: true,
    section: true,
    category: true,
    ticketHolder: true,
    ticketType: true,
    price: true,
    reference: true,
    gate: true
  },
  holographicEffect: false,
  antiCopyCode: true
}

export { DEFAULT_DESIGN }

export default PrintConfigPanel
