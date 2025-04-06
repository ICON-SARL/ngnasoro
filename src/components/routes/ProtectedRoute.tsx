
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
  
  console.log('ProtectedRoute state:', { 
    path: location.pathname,
    user: user?.email || 'no user', 
    loading, 
    requireAdmin, 
    requireSfdAdmin 
  });

  // Show loading state while authentication is being checked
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0D6A51]"></div>
      <span className="ml-3">Chargement...</span>
    </div>;
  }

  // If not authenticated at all, redirect to the login page
  if (!user) {
    console.log('No user, redirecting to auth page');
    // Redirect to appropriate auth page based on the required role
    if (requireAdmin) {
      return <Navigate to="/admin/auth" state={{ from: location.pathname }} replace />;
    } else if (requireSfdAdmin) {
      return <Navigate to="/sfd/auth" state={{ from: location.pathname }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
    }
  }
  
  // If user is authenticated but doesn't have the required role
  const userRole = user.app_metadata?.role;
  console.log('Role check:', { 
    userEmail: user.email,
    userRole, 
    requireAdmin, 
    requireSfdAdmin
  });
  
  if (requireAdmin && userRole !== 'admin') {
    console.log('Access denied: Not an admin');
    return <Navigate to="/access-denied" state={{ from: location.pathname }} replace />;
  }
  
  if (requireSfdAdmin && userRole !== 'sfd_admin') {
    console.log('Access denied: Not an SFD admin');
    return <Navigate to="/access-denied" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated and has the correct role
  console.log('Access granted to', location.pathname);
  return <Component {...rest} />;
};

export default ProtectedRoute;
