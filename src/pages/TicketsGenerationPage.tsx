import React, { useState, useEffect, useMemo, useCallback } from 'react'
import BizOSPluginShell from '../components/plugin/BizOSPluginShell'
import TicketGenerator from '../components/tickets/TicketGenerator'
import { TicketFinanceDashboard } from '../components/tickets/TicketFinanceDashboard'
import { TicketAnalyticsDashboard } from '../components/tickets/TicketAnalyticsDashboard'
import { ScannerApp } from '../components/tickets/ScannerApp'
import type { PluginSection } from '../types/plugin'
import type { TicketData, TicketDesign } from '../types/ticket'
import {
  subscribeToEventTickets,
  saveTicketsBatch,
  updateTicketStatus,
} from '../services/ticketService'

// ============================================
// SECTIONS DU PLUGIN (navigation latérale)
// ============================================
const PLUGIN_SECTIONS: PluginSection[] = [
  {
    id: 'main',
    title: 'Pilotage',
    icon: '◆',
    modules: [
      { id: 'dashboard', name: 'Dashboard', icon: '◈', path: '/dashboard' },
      { id: 'events', name: 'Événements', icon: '▦', path: '/events', badge: '12' },
      { id: 'analytics', name: 'Analytics', icon: '↗', path: '/analytics', badge: 'NEW' },
      { id: 'finance', name: 'Finances', icon: '💰', path: '/finance', badge: 'PRO' }
    ]
  },
  {
    id: 'ticketing',
    title: 'Billetterie',
    icon: '🎫',
    defaultOpen: true,
    modules: [
      { id: 'tickets-list', name: 'Tous les billets', icon: '▦', path: '/tickets', badge: '847' },
      { id: 'tickets-generate', name: 'Générer PDF', icon: '🖨', path: '/tickets/generate' },
      { id: 'tickets-checkin', name: 'Check-in', icon: '✓', path: '/checkin' },
      { id: 'tickets-validation', name: 'Validation QR', icon: '▣', path: '/validation' }
    ]
  },
  {
    id: 'config',
    title: 'Configuration',
    icon: '⚙',
    modules: [
      { id: 'venues', name: 'Lieux', icon: '⬢', path: '/venues' },
      { id: 'speakers', name: 'Artistes', icon: '◉', path: '/speakers' },
      { id: 'promo-codes', name: 'Codes promo', icon: '🏷', path: '/promo' }
    ]
  }
]

// ============================================
// MOCK DATA (à remplacer par Firestore)
// ============================================
const generateMockTickets = (count: number, eventContext: any): TicketData[] => {
  const tiers: Array<{ tier: TicketData['tier']; ticketName: string }> = [
    { tier: 'STANDARD', ticketName: 'Standard' },
    { tier: 'PREMIUM', ticketName: 'Premium' },
    { tier: 'VIP', ticketName: 'VIP' }
  ]
  const sections = ['Orchestre', 'Carré Or', 'Balcon', 'Mezzanine', 'Fosse Or']
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Emma', 'Hugo', 'Léa', 'Nathan', 'Chloé']
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois']

  return Array.from({ length: count }, (_, i) => {
    const t = tiers[i % 3]
    const section = sections[i % sections.length]
    const row = rows[Math.floor(i / 10) % rows.length]
    const number = (i % 25) + 1
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length]

    const ticketRef = `ECO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    const qrPayload = btoa(JSON.stringify({
      ticketId: `tkt-${i}`,
      bookingId: `bk-${Math.floor(i / 2)}`,
      eventId: eventContext.id,
      userId: `user-${i}`,
      timestamp: Date.now(),
      signature: Math.random().toString(36).substring(2, 18)
    }))

    return {
      id: `tkt-${i}`,
      reference: ticketRef,
      ticketConfigId: `tc-${i % 3}`,
      ticketName: t.ticketName,
      tier: t.tier,
      qrPayload,
      qrCodeUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="white"/><text x="40" y="45" text-anchor="middle" font-size="10">QR</text></svg>')}`,
      signature: Math.random().toString(36).substring(2, 30),
      status: i % 17 === 0 ? 'USED' : 'VALID',

      eventId: eventContext.id,
      event: {
        id: eventContext.id,
        title: eventContext.title,
        subtitle: eventContext.subtitle,
        startDate: eventContext.startDate,
        endDate: eventContext.endDate,
        category: 'Musique',
        type: 'Concert',
        organizer: { name: 'Pulse Events', logo: '' }
      },

      venue: {
        id: 'venue-1',
        name: 'Bercy Arena',
        address: '8 Boulevard de Bercy',
        city: 'Paris',
        gates: [
          { id: 'A', name: 'Entrée A' },
          { id: 'B', name: 'Entrée B' },
          { id: 'C', name: 'Entrée VIP' }
        ]
      },

      seat: {
        id: `seat-${i}`,
        section,
        row,
        number,
        category: t.ticketName,
        color: t.tier === 'VIP' ? '#ffb800' : t.tier === 'PREMIUM' ? '#ff00aa' : '#00e5ff'
      },

      holder: {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `06${Math.random().toString().substring(2, 10)}`
      },

      pricing: {
        unitPrice: t.tier === 'VIP' ? 199 : t.tier === 'PREMIUM' ? 89 : 49,
        fees: 2.85,
        total: (t.tier === 'VIP' ? 199 : t.tier === 'PREMIUM' ? 89 : 49) + 2.85,
        currency: 'EUR'
      },

      issuedAt: Date.now() - i * 86400000,
      gate: t.tier === 'VIP' ? 'C' : 'A'
    }
  })
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function TicketsGenerationPage() {
  const [activeModule, setActiveModule] = useState('tickets-generate')
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)

  // Contexte de l'événement (mock — à remplacer par currentEvent depuis context)
  const eventContext = useMemo(() => ({
    id: 'evt-festival-electro-2024',
    title: 'Festival Électro Summer 2024',
    subtitle: '3 jours de musique électronique en plein air',
    startDate: '2024-07-15T18:00:00Z',
    endDate: '2024-07-15T23:30:00Z',
    organizer: 'Pulse Events'
  }), [])

  // Souscription Firestore avec fallback mock
  useEffect(() => {
    setLoading(true)

    const unsubscribe = subscribeToEventTickets(
      eventContext.id,
      (firestoreTickets) => {
        if (firestoreTickets.length > 0) {
          setTickets(firestoreTickets)
        } else {
          // Firestore vide ou non configuré → on affiche les mocks
          setTickets(generateMockTickets(20, eventContext))
        }
        setLoading(false)
      },
      (_err) => {
        // Firestore indisponible → fallback mocks
        setTickets(generateMockTickets(20, eventContext))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [eventContext])

  // ============================================
  // CALLBACKS D'ACTIONS
  // ============================================
  const handleGenerate = useCallback(async (config: any) => {
    console.log('📄 Génération PDF:', config)
    // Sauvegarde les billets sélectionnés (ou tous) dans Firestore
    const toSave = config?.selectedIds?.length
      ? tickets.filter(t => config.selectedIds.includes(t.id))
      : tickets
    const { saved, failed } = await saveTicketsBatch(toSave)
    console.log(`✅ ${saved} billets sauvegardés, ❌ ${failed} échecs`)
  }, [tickets])

  const handlePrint = useCallback((config: any) => {
    console.log('🖨 Impression directe:', config)
  }, [])

  const handleSaveDesign = useCallback((design: TicketDesign) => {
    console.log('💾 Design sauvegardé:', design)
  }, [])

  // ============================================
  // CONTENU PAR MODULE
  // ============================================
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'tickets-generate':
        return (
          <TicketGenerator
            tickets={tickets}
            eventContext={eventContext}
            onGenerate={handleGenerate}
            onPrint={handlePrint}
            onSaveDesign={handleSaveDesign}
          />
        )
      case 'analytics':
        return (
          <TicketAnalyticsDashboard
            eventId={eventContext.id}
            eventTitle={eventContext.title}
            ticketsFallback={tickets}
          />
        )
      case 'finance':
        return (
          <TicketFinanceDashboard
            eventId={eventContext.id}
            eventTitle={eventContext.title}
            ticketsFallback={tickets}
          />
        )
      case 'tickets-list':
        return <TicketsListPlaceholder tickets={tickets} />
      case 'tickets-checkin':
        return (
          <div style={{ height: 'calc(100vh - 140px)', background: '#0e0618' }}>
            <ScannerApp />
          </div>
        )
      case 'dashboard':
      case 'events':
        return <ModulePlaceholder name={activeModule} />
      default:
        return (
          <div className="bizos-empty">
            <div className="bizos-empty-icon">🚧</div>
            <h3>Module en construction</h3>
            <p>Le module "{activeModule}" arrive bientôt.</p>
          </div>
        )
    }
  }

  // ============================================
  // BREADCRUMB DYNAMIQUE
  // ============================================
  const breadcrumb = useMemo(() => {
    const moduleLabel = PLUGIN_SECTIONS
      .flatMap(s => s.modules)
      .find(m => m.id === activeModule)?.name || activeModule

    return [
      { label: 'Plugins', href: '/' },
      { label: 'Billetterie', href: '/tickets' },
      { label: moduleLabel }
    ]
  }, [activeModule])

  // ============================================
  // HEADER ACTIONS
  // ============================================
  const headerActions = (
    <>
      <button
        className="bizos-btn bizos-btn-secondary bizos-btn-sm"
        onClick={() => window.history.back()}
      >
        ← Retour
      </button>
      <button
        className="bizos-btn bizos-btn-secondary bizos-btn-sm"
        onClick={() => location.reload()}
      >
        🔄 Actualiser
      </button>
    </>
  )

  // ============================================
  // DATA CONTEXT
  // ============================================
  const dataContext = {
    currentEvent: eventContext,
    currentUser: { uid: 'u-demo', role: 'EVENT_MANAGER' },
    permissions: ['tickets:read', 'tickets:create', 'events:read'],
    organization: { id: 'org-1', name: 'ECOASSET' }
  }

  // ============================================
  // RENDU
  // ============================================
  return (
    <BizOSPluginShell
      pluginId="ecoasset-tickets"
      pluginName="ECOASSET"
      pluginIcon="E"
      sections={PLUGIN_SECTIONS}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      breadcrumb={breadcrumb}
      pageTitle={`🎫 ${breadcrumb[breadcrumb.length - 1].label}`}
      pageSubtitle={`${tickets.length} billets dans ${eventContext.title}`}
      headerActions={headerActions}
      dataContext={dataContext}
      loading={loading}
      theme={{
        showNotifications: true,
        showProfile: true,
        showSearch: true
      }}
      onSearch={(query: string) => console.log('🔍 Recherche:', query)}
      onNotificationClick={() => alert('🔔 Centre de notifications')}
      onProfileClick={() => alert('👤 Mon profil')}
    >
      {renderActiveModule()}
    </BizOSPluginShell>
  )
}

// ============================================
// PLACEHOLDERS (temporaires)
// ============================================
const TicketsListPlaceholder: React.FC<{ tickets: TicketData[] }> = ({ tickets }) => (
  <div className="tickets-list-placeholder">
    <h3>📋 Liste des billets ({tickets.length})</h3>
    <div className="tickets-list-grid">
      {tickets.slice(0, 12).map(t => (
        <div key={t.id} className="tickets-list-item">
          <code>{t.reference}</code>
          <strong>{t.holder.fullName}</strong>
          <small>{t.tier} · {t.seat.section} {t.seat.row}{t.seat.number}</small>
          <span className={`status-badge status-${t.status.toLowerCase()}`}>
            {t.status}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const CheckInPlaceholder: React.FC = () => (
  <div className="bizos-empty" style={{ padding: '80px 24px' }}>
    <div className="bizos-empty-icon">📷</div>
    <h3>Scanner QR — Module Check-in</h3>
    <p>Ce module utilisera la caméra pour scanner les billets à l'entrée.</p>
  </div>
)

const ModulePlaceholder: React.FC<{ name: string }> = ({ name }) => (
  <div className="bizos-empty" style={{ padding: '80px 24px' }}>
    <div className="bizos-empty-icon">🚧</div>
    <h3>Module {name}</h3>
    <p>Contenu à intégrer</p>
  </div>
)
