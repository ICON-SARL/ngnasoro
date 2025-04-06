
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { getRoleFromSession } from '@/hooks/auth/authUtils';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  requireAdmin?: boolean;
  requireSfdAdmin?: boolean;
  [x: string]: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  component: Component, 
  requireAdmin = false,
  requireSfdAdmin = false,
  ...rest 
}) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!user) {
    // Only redirect if we require authentication for this route
    if (requireAdmin) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requireSfdAdmin) {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      // For non-protected routes, just render the component
      return <Component {...rest} />;
    }
  }
  
  const userRole = user.app_metadata?.role;
  
  // Vérifier les permissions basées sur le rôle
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/admin/auth" state={{ from: location, error: 'access_denied' }} replace />;
  }
  
  if (requireSfdAdmin && userRole !== 'sfd_admin') {
    return <Navigate to="/sfd/auth" state={{ from: location, error: 'access_denied' }} replace />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
