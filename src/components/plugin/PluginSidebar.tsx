import React, { useState } from 'react'
import type { PluginSection, PluginModule } from '../../types/plugin'

interface PluginSidebarProps {
  pluginName: string
  pluginIcon: string
  sections: PluginSection[]
  activeModule: string
  onModuleChange: (moduleId: string) => void
  isOpen: boolean
  onToggle: () => void
  collapsedSections: Set<string>
  onToggleSection: (sectionId: string) => void
  footer?: React.ReactNode
  showSearch?: boolean
  searchQuery: string
  onSearch: (query: string) => void
}

const PluginSidebar: React.FC<PluginSidebarProps> = ({
  pluginName,
  pluginIcon,
  sections,
  activeModule,
  onModuleChange,
  isOpen,
  onToggle,
  collapsedSections,
  onToggleSection,
  footer,
  showSearch = true,
  searchQuery,
  onSearch
}) => {
  return (
    <aside className={`bizos-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Header logo */}
      <div className="bizos-sidebar-header">
        <div className="bizos-logo">
          <div className="bizos-logo-mark">{pluginIcon}</div>
          {isOpen && (
            <div className="bizos-logo-content">
              <div className="bizos-logo-text">{pluginName}</div>
              <div className="bizos-logo-subtitle">Plugin</div>
            </div>
          )}
        </div>
        <button
          className="bizos-sidebar-toggle"
          onClick={onToggle}
          title={isOpen ? 'Réduire (Ctrl+B)' : 'Ouvrir (Ctrl+B)'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Search */}
      {showSearch && isOpen && (
        <div className="bizos-sidebar-search">
          <span className="bizos-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Rechercher un module..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="bizos-sidebar-search-input"
          />
          {searchQuery && (
            <button
              className="bizos-search-clear"
              onClick={() => onSearch('')}
              title="Effacer"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Navigation sections */}
      <nav className="bizos-sidebar-nav">
        {sections.map(section => {
          const isCollapsed = collapsedSections.has(section.id) && isOpen

          return (
            <div key={section.id} className="bizos-nav-section">
              {isOpen && section.title && (
                <div
                  className="bizos-nav-section-header"
                  onClick={() => section.collapsible !== false && onToggleSection(section.id)}
                >
                  {section.icon && <span className="bizos-nav-section-icon">{section.icon}</span>}
                  <span className="bizos-nav-section-title">{section.title}</span>
                  {section.collapsible !== false && (
                    <span className="bizos-nav-section-caret">
                      {isCollapsed ? '▸' : '▾'}
                    </span>
                  )}
                </div>
              )}

              {!isCollapsed && (
                <div className="bizos-nav-modules">
                  {section.modules.map(module => (
                    <ModuleItem
                      key={module.id}
                      module={module}
                      active={activeModule === module.id}
                      onClick={() => onModuleChange(module.id)}
                      isOpen={isOpen}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {footer && isOpen && (
        <div className="bizos-sidebar-footer">
          {footer}
        </div>
      )}
    </aside>
  )
}

const ModuleItem: React.FC<{
  module: PluginModule
  active: boolean
  onClick: () => void
  isOpen: boolean
}> = ({ module, active, onClick, isOpen }) => {
  return (
    <button
      className={`bizos-nav-module ${active ? 'active' : ''}`}
      onClick={onClick}
      title={!isOpen ? module.name : undefined}
    >
      <span className="bizos-nav-module-icon">{module.icon}</span>
      {isOpen && (
        <>
          <span className="bizos-nav-module-name">{module.name}</span>
          {module.badge && (
            <span className="bizos-nav-module-badge">{module.badge}</span>
          )}
        </>
      )}
      {active && <span className="bizos-nav-module-indicator" />}
    </button>
  )
}

export default PluginSidebar
