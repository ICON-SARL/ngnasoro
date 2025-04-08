
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

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
  const { user, loading, isAdmin, isSfdAdmin } = useAuth();
  const location = useLocation();
  
  // Ne pas rediriger depuis la page d'accueil
  if (location.pathname === '/' || location.pathname === '/index') {
    return <Component {...rest} />;
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!user) {
    // Redirect to the appropriate authentication page based on requirements
    if (requireAdmin) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requireSfdAdmin) {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }
  
  const userRole = user.app_metadata?.role;
  
  // Check role-based permissions
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/admin/auth" state={{ from: location, error: 'access_denied' }} replace />;
  }
  
  if (requireSfdAdmin && userRole !== 'sfd_admin') {
    return <Navigate to="/sfd/auth" state={{ from: location, error: 'access_denied' }} replace />;
  }

  // If the user is an SFD admin and trying to access client routes, redirect to SFD dashboard
  if (!requireSfdAdmin && !requireAdmin && userRole === 'sfd_admin' && location.pathname.includes('/mobile-flow')) {
    return <Navigate to="/agency-dashboard" replace />;
  }

  // If the user is an admin and trying to access client routes, redirect to admin dashboard
  if (!requireAdmin && !requireSfdAdmin && userRole === 'admin' && location.pathname.includes('/mobile-flow')) {
    return <Navigate to="/super-admin-dashboard" replace />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
