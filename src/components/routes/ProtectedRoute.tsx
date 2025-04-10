
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

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
  const { user, loading, session } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!user) {
    // Rediriger vers la page d'authentification appropriée basée sur les exigences
    if (requireAdmin) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requireSfdAdmin) {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
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

  return <>{children}</>;
};

export default ProtectedRoute;
