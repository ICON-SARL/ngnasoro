
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
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // If we're requiring authentication and the user isn't logged in
  if ((requireAdmin || requireSfdAdmin) && !user) {
    // Redirect to the appropriate login page
    if (requireAdmin) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requireSfdAdmin) {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }
  
  // If user is logged in, check role permissions
  if (user) {
    const userRole = user.app_metadata?.role;
    
    // Check role-based access
    if (requireAdmin && userRole !== 'admin') {
      return <Navigate to="/admin/auth" state={{ from: location, error: 'access_denied' }} replace />;
    }
    
    if (requireSfdAdmin && userRole !== 'sfd_admin') {
      return <Navigate to="/sfd/auth" state={{ from: location, error: 'access_denied' }} replace />;
    }
  }

  // If we've passed all checks, or if no special permissions are required, render the component
  return <Component {...rest} />;
};

export default ProtectedRoute;
