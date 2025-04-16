
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/utils/auth/roleTypes';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole | string;
  fallbackPath?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRole,
  fallbackPath = '/login'
}) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();
  
  console.log('RoleGuard checking access:', { userRole, requiredRole, path: location.pathname });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 border-b-2 border-primary mr-2" />
        <span>Chargement...</span>
      </div>
    );
  }
  
  if (!user) {
    // Pour les différents types d'utilisateurs, rediriger vers la page de connexion appropriée
    if (requiredRole === UserRole.SUPER_ADMIN || requiredRole === 'admin') {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requiredRole === UserRole.SFD_ADMIN || requiredRole === 'sfd_admin') {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }
  
  // Vérifier si l'utilisateur a le rôle requis
  const hasRequiredRole = 
    userRole === requiredRole || 
    (requiredRole === UserRole.SFD_ADMIN && userRole === 'sfd_admin') ||
    (requiredRole === UserRole.SUPER_ADMIN && userRole === 'admin');
    
  if (!hasRequiredRole) {
    console.log('Access denied. Required role:', requiredRole, 'User role:', userRole);
    return <Navigate to="/access-denied" state={{ from: location, requiredRole }} replace />;
  }
  
  return <>{children}</>;
};

export default RoleGuard;
