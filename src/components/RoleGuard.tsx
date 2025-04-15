
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/utils/auth/roleTypes';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole | string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      return;
    }

    // Get role from user metadata
    const userRole = user.app_metadata?.role;
    
    console.log('RoleGuard checking:', { 
      userRole, 
      requiredRole, 
      userMetadata: user.app_metadata,
      path: location.pathname
    });
    
    // Admin has access to everything except client routes
    if (userRole === 'admin' && requiredRole !== UserRole.CLIENT) {
      setHasAccess(true);
      return;
    }
    
    // Direct role comparison
    setHasAccess(userRole === requiredRole);
    
  }, [user, requiredRole, location.pathname]);

  if (loading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Vérification des autorisations...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate auth page based on required role
    if (requiredRole === UserRole.SUPER_ADMIN || requiredRole === 'admin') {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requiredRole === UserRole.SFD_ADMIN || requiredRole === 'sfd_admin') {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }

  if (!hasAccess) {
    return (
      <Navigate 
        to="/access-denied" 
        state={{ 
          from: location.pathname,
          requiredRole: String(requiredRole)
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default RoleGuard;

