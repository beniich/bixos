import type { ReactNode } from 'react'

export interface PluginModule {
  id: string
  name: string
  icon: string
  path: string
  description?: string
  badge?: string | number
  permissions?: string[]
  shortcut?: string
}

export interface PluginSection {
  id: string
  title: string
  icon?: string
  modules: PluginModule[]
  collapsible?: boolean
  defaultOpen?: boolean
}

export interface PluginTheme {
  primaryColor?: string
  accentColor?: string
  showBreadcrumb?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  showProfile?: boolean
  compact?: boolean
}

export interface PluginDataContext {
  currentEvent?: any
  currentUser?: any
  permissions: string[]
  organization?: any
}

export interface BizOSPluginProps {
  pluginId: string
  pluginName: string
  pluginIcon: string
  sections: PluginSection[]
  activeModule: string
  onModuleChange: (moduleId: string) => void

  breadcrumb?: Array<{ label: string; href?: string }>
  pageTitle?: string
  pageSubtitle?: string
  headerActions?: ReactNode

  children: ReactNode
  sidebarFooter?: ReactNode
  toolbar?: ReactNode

  dataContext?: PluginDataContext
  theme?: PluginTheme

  loading?: boolean
  error?: string | null

  onSearch?: (query: string) => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
}
