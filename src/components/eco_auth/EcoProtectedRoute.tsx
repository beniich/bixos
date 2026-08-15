// src/components/eco_auth/EcoProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: { resource: string; action: 'create' | 'read' | 'update' | 'delete' }[];
  onUnauthorized?: () => void;
  onUnauthenticated?: () => void;
}

const EcoProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
  onUnauthorized,
  onUnauthenticated
}) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="bizos-loader">
        <div className="bizos-loader-spinner" />
      </div>
    );
  }

  if (!user) {
    onUnauthenticated?.();
    return null;
  }

  if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
    onUnauthorized?.();
    return null;
  }

  if (requiredPermissions) {
    const hasAll = requiredPermissions.every(p => hasPermission(p.resource, p.action));
    if (!hasAll) {
      onUnauthorized?.();
      return null;
    }
  }

  return <>{children}</>;
};

export default EcoProtectedRoute;
