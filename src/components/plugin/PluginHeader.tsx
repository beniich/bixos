import React from 'react'

interface PluginHeaderProps {
  breadcrumb?: Array<{ label: string; href?: string }>
  pageTitle?: string
  pageSubtitle?: string
  actions?: React.ReactNode
  showNotifications?: boolean
  showProfile?: boolean
  onNotificationClick?: () => void
  onProfileClick?: () => void
  onMenuToggle?: () => void
}

const PluginHeader: React.FC<PluginHeaderProps> = ({
  breadcrumb,
  pageTitle,
  pageSubtitle,
  actions,
  showNotifications = true,
  showProfile = true,
  onNotificationClick,
  onProfileClick,
  onMenuToggle
}) => {
  return (
    <header className="bizos-header">
      <div className="bizos-header-left">
        <button className="bizos-header-menu-toggle" onClick={onMenuToggle} title="Menu (Ctrl+B)">
          ☰
        </button>
        <div className="bizos-header-titles">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="bizos-breadcrumb">
              {breadcrumb.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="bizos-breadcrumb-separator">/</span>}
                  {item.href ? (
                    <a href={item.href} className="bizos-breadcrumb-link">{item.label}</a>
                  ) : (
                    <span className="bizos-breadcrumb-current">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          {pageTitle && (
            <div className="bizos-page-title-wrapper">
              <h1 className="bizos-page-title">{pageTitle}</h1>
              {pageSubtitle && <p className="bizos-page-subtitle">{pageSubtitle}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="bizos-header-right">
        {actions && <div className="bizos-header-actions">{actions}</div>}
        {showNotifications && (
          <button className="bizos-header-icon-btn" onClick={onNotificationClick} title="Notifications">
            🔔
            <span className="bizos-header-notif-dot" />
          </button>
        )}
        {showProfile && (
          <button className="bizos-header-profile" onClick={onProfileClick} title="Mon profil">
            <div className="bizos-header-avatar">JD</div>
          </button>
        )}
      </div>
    </header>
  )
}

export default PluginHeader
