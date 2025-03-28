
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { logPermissionFailure } from '@/utils/audit/auditLogger';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/utils/auth/roleTypes';

interface PermissionProtectedRouteProps {
  component: React.ComponentType<any>;
  requiredPermission?: string;
  requiredRole?: UserRole; // Fixed type to use the enum directly
  fallbackPath?: string;
  [x: string]: any;
}

const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({ 
  component: Component, 
  requiredPermission,
  requiredRole,
  fallbackPath = '/login',
  ...rest 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, hasRole, loading: permissionsLoading } = usePermissions();
  const location = useLocation();
  
  const isLoading = authLoading || permissionsLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des permissions...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }
  
  let hasAccess = true;
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    logPermissionFailure(user.id, requiredPermission, location.pathname);
    hasAccess = false;
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    logPermissionFailure(user.id, `role:${requiredRole}`, location.pathname);
    hasAccess = false;
  }
  
  if (!hasAccess) {
    return <Navigate to="/access-denied" state={{ from: location, requiredPermission, requiredRole }} replace />;
  }

  return <Component {...rest} />;
};

export default PermissionProtectedRoute;
