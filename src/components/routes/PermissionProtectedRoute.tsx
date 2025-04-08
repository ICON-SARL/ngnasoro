
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { UserRole } from '@/utils/auth/roleTypes';

interface PermissionProtectedRouteProps {
  component: React.ComponentType;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallbackPath?: string;
}

const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({ 
  component: Component,
  requiredRole,
  requiredPermission,
  fallbackPath = '/auth'
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Basic auth check
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Simple permission check based on user metadata
  // In a real app, you'd have a more sophisticated permissions system
  const userRole = user.app_metadata?.role || 'user';
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // This is a simplified permission check
  // In a real app, you'd check if the user has the specific permission
  if (requiredPermission && !user.app_metadata?.permissions?.includes(requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Component />;
};

export default PermissionProtectedRoute;
