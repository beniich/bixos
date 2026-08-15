import React, { useState, useEffect, useCallback } from 'react'
import PluginHeader from './PluginHeader'
import PluginSidebar from './PluginSidebar'
import PluginDataProvider from './PluginDataProvider'
import type { BizOSPluginProps } from '../../types/plugin'

const BizOSPluginShell: React.FC<BizOSPluginProps> = ({
  pluginId,
  pluginName,
  pluginIcon,
  sections,
  activeModule,
  onModuleChange,
  breadcrumb,
  pageTitle,
  pageSubtitle,
  headerActions,
  children,
  sidebarFooter,
  toolbar,
  dataContext,
  theme = {},
  loading = false,
  error = null,
  onSearch,
  onNotificationClick,
  onProfileClick
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }, [onSearch])

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId)
      return next
    })
  }

  const filteredSections = searchQuery
    ? sections
        .map(section => ({
          ...section,
          modules: section.modules.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }))
        .filter(section => section.modules.length > 0)
    : sections

  return (
    <PluginDataProvider context={dataContext || { permissions: [] }}>
      <div
        className={`bizos-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${theme.compact ? 'compact' : ''}`}
        data-plugin={pluginId}
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--bizos-bg, #0a0e1a)',
          color: 'var(--bizos-text, #e2e8f0)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <PluginSidebar
          pluginName={pluginName}
          pluginIcon={pluginIcon}
          sections={filteredSections}
          activeModule={activeModule}
          onModuleChange={onModuleChange}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
          collapsedSections={collapsedSections}
          onToggleSection={toggleSection}
          footer={sidebarFooter}
          showSearch={theme.showSearch !== false}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />

        <div className="bizos-shell-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PluginHeader
            breadcrumb={breadcrumb}
            pageTitle={pageTitle}
            pageSubtitle={pageSubtitle}
            actions={headerActions}
            showNotifications={theme.showNotifications !== false}
            showProfile={theme.showProfile !== false}
            onNotificationClick={onNotificationClick}
            onProfileClick={onProfileClick}
            onMenuToggle={() => setSidebarOpen(prev => !prev)}
          />

          {toolbar && (
            <div className="bizos-shell-toolbar" style={{ padding: '0 24px', borderBottom: '1px solid var(--bizos-border, rgba(255,255,255,0.08))' }}>
              {toolbar}
            </div>
          )}

          <main className="bizos-shell-content" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
                <div className="bizos-loader-spinner" style={{ width: 40, height: 40, border: '3px solid rgba(0,229,255,0.2)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Chargement...</p>
              </div>
            ) : error ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                <div style={{ fontSize: 48 }}>⚠</div>
                <h2>Une erreur est survenue</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
              </div>
            ) : children}
          </main>
        </div>
      </div>
    </PluginDataProvider>
  )
}

export default BizOSPluginShell
