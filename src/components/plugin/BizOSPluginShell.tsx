import React, { useState, useEffect, useCallback } from 'react'
import PluginHeader from './PluginHeader'
import PluginSidebar from './PluginSidebar'
import PluginTabs from './PluginTabs'
import PluginDataProvider from './PluginDataProvider'
import type { BizOSPluginProps, PluginSection } from '../../types/plugin'

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

  // Auto-collapse sidebar sur petits écrans
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Raccourci clavier : Ctrl+B pour toggle sidebar
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
      // Échap pour fermer
      if (e.key === 'Escape' && !sidebarOpen) {
        setSidebarOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [sidebarOpen])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }, [onSearch])

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const filteredSections = searchQuery
    ? sections.map(section => ({
        ...section,
        modules: section.modules.filter(m =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.modules.length > 0)
    : sections

  return (
    <PluginDataProvider context={dataContext || { permissions: [] }}>
      <div
        className={`bizos-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${theme.compact ? 'compact' : ''}`}
        data-plugin={pluginId}
      >
        {/* Sidebar */}
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

        {/* Main content area */}
        <div className="bizos-shell-main">
          {/* Header */}
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

          {/* Tabs (si plusieurs onglets dans le module) */}
          {toolbar && (
            <div className="bizos-shell-toolbar">
              {toolbar}
            </div>
          )}

          {/* Content */}
          <main className="bizos-shell-content">
            {loading ? (
              <div className="bizos-shell-loading">
                <div className="bizos-loader-spinner" />
                <p>Chargement...</p>
              </div>
            ) : error ? (
              <div className="bizos-shell-error">
                <div className="bizos-error-icon">⚠</div>
                <h2>Une erreur est survenue</h2>
                <p>{error}</p>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </PluginDataProvider>
  )
}

export default BizOSPluginShell
