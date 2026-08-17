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

  // Header
  breadcrumb?: Array<{ label: string; href?: string }>
  pageTitle?: string
  pageSubtitle?: string
  headerActions?: ReactNode

  // Content
  children: ReactNode
  sidebarFooter?: ReactNode
  toolbar?: ReactNode

  // Data context
  dataContext?: PluginDataContext

  // Theming
  theme?: PluginTheme

  // État
  loading?: boolean
  error?: string | null

  // Callbacks
  onSearch?: (query: string) => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
}
