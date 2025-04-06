
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
  
  // Show loading state while authentication is being checked
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // If not authenticated at all, redirect to the appropriate login page
  if (!user) {
    if (requireAdmin) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requireSfdAdmin) {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }
  
  // If user is authenticated but doesn't have the required role
  const userRole = user.app_metadata?.role;
  
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }
  
  if (requireSfdAdmin && userRole !== 'sfd_admin') {
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  // User is authenticated and has the correct role
  return <Component {...rest} />;
};

export default ProtectedRoute;
