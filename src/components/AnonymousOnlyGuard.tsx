
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AnonymousOnlyGuardProps {
  children: React.ReactNode;
}

const AnonymousOnlyGuard: React.FC<AnonymousOnlyGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 border-b-2 border-primary mr-2" />
        <span>Chargement...</span>
      </div>
    );
  }
  
  // Si user est authentifié, rediriger vers le tableau de bord approprié
  if (user) {
    // Récupérer le rôle depuis user.app_metadata
    const role = user.app_metadata?.role;
    
    console.log('AnonymousOnlyGuard - User role:', role);
    console.log('AnonymousOnlyGuard - User metadata:', user.app_metadata);
    
    if (role === 'admin') {
      return <Navigate to="/super-admin-dashboard" state={{ from: location }} replace />;
    } else if (role === 'sfd_admin') {
      return <Navigate to="/agency-dashboard" state={{ from: location }} replace />;
    } else {
      // Défaut pour les utilisateurs réguliers
      return <Navigate to="/mobile-flow/main" state={{ from: location }} replace />;
    }
  }
  
  // Si user n'est pas authentifié, afficher les enfants (formulaires login/register)
  return <>{children}</>;
};

export default AnonymousOnlyGuard;
