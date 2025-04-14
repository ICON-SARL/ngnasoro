
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSfdAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireSfdAdmin = false,
}) => {
  const { user, loading, isAdmin, isSfdAdmin } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate auth page based on requirements
    if (requireAdmin) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requireSfdAdmin) {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }
  
  // Check role-based permissions
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/access-denied" state={{ from: location, requiredRole: 'admin' }} replace />;
  }
  
  if (requireSfdAdmin && !isSfdAdmin) {
    return <Navigate to="/access-denied" state={{ from: location, requiredRole: 'sfd_admin' }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
