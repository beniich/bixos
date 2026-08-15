import React, { createContext, useContext, useMemo } from 'react'
import type { PluginDataContext } from '../../types/plugin'

interface ProviderState extends PluginDataContext {
  hasPermission: (permission: string) => boolean
  canAccessModule: (moduleId: string, requiredPermissions?: string[]) => boolean
}

const DataContext = createContext<ProviderState | null>(null)

interface PluginDataProviderProps {
  context?: PluginDataContext
  children: React.ReactNode
}

const PluginDataProvider: React.FC<PluginDataProviderProps> = ({ context, children }) => {
  const value = useMemo<ProviderState>(() => {
    const permissions = context?.permissions || []
    const user = context?.currentUser

    return {
      currentEvent: context?.currentEvent,
      currentUser: user,
      permissions,
      organization: context?.organization,
      hasPermission: (permission: string) => {
        if (!user) return false
        if (user.role === 'SUPER_ADMIN') return true
        return permissions.includes(permission) || user.permissions?.includes(permission)
      },
      canAccessModule: (_moduleId: string, requiredPermissions: string[] = []) => {
        if (requiredPermissions.length === 0) return true
        return requiredPermissions.every(p => permissions.includes(p))
      }
    }
  }, [context])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const usePluginData = (): ProviderState => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('usePluginData must be used within PluginDataProvider')
  return ctx
}

export default PluginDataProvider
