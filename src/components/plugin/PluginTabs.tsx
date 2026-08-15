import React from 'react'

interface PluginTabsProps {
  tabs: Array<{
    id: string
    label: string
    icon?: string
    badge?: string | number
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
}

const PluginTabs: React.FC<PluginTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pills',
  size = 'md'
}) => {
  return (
    <div className={`bizos-tabs variant-${variant} size-${size}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`bizos-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className="bizos-tab-icon">{tab.icon}</span>}
          <span className="bizos-tab-label">{tab.label}</span>
          {tab.badge !== undefined && (
            <span className="bizos-tab-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default PluginTabs
