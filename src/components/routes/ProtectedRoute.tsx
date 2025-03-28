
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
  const { user, session, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!user) {
    // Rediriger vers la page d'authentification avec l'URL d'origine comme "from"
    return <Navigate to={`/auth${requireAdmin || requireSfdAdmin ? '?admin=true' : ''}`} state={{ from: location }} replace />;
  }
  
  const userRole = session ? getRoleFromSession(session) : null;
  
  // Vérifier les permissions basées sur le rôle
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/auth?admin=true" state={{ from: location, error: 'access_denied' }} replace />;
  }
  
  if (requireSfdAdmin && userRole !== 'sfd_admin') {
    return <Navigate to="/auth?admin=true" state={{ from: location, error: 'access_denied' }} replace />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
