
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
  
  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2" />
        <span>Chargement...</span>
      </div>
    );
  }

  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  if (!user) {
    // Rediriger vers le type d'authentification approprié en fonction des exigences
    let redirectPath = '/auth';
    
    if (requireAdmin) {
      redirectPath = '/admin/auth';
    } else if (requireSfdAdmin) {
      redirectPath = '/sfd/auth';
    }
    
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }
  
  // Vérifier les autorisations basées sur les rôles
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/access-denied" state={{ from: location.pathname, requiredRole: 'admin' }} replace />;
  }
  
  if (requireSfdAdmin && !isSfdAdmin) {
    return <Navigate to="/access-denied" state={{ from: location.pathname, requiredRole: 'sfd_admin' }} replace />;
  }

  // Si l'utilisateur est authentifié et a les autorisations nécessaires, afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
