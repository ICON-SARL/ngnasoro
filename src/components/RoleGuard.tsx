
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRole
}) => {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading) {
      console.info("RoleGuard checking:", { 
        userRole, 
        requiredRole,
        userMetadata: user?.app_metadata,
        path: location.pathname
      });
    }
  }, [loading, user, userRole, requiredRole, location.pathname]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Vérification de l'authentification...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Check for required role if specified
  if (requiredRole && userRole !== requiredRole) {
    console.warn(`Accès refusé: ${userRole} ne correspond pas au rôle requis ${requiredRole}`);
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
