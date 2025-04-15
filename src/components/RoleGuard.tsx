
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/utils/auth/roleTypes';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
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

    const userRole = user.app_metadata?.role;
    
    // Super admins have access to everything except client routes
    if (userRole === 'admin') {
      if (requiredRole === UserRole.CLIENT) {
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }
      return;
    }
    
    // Check for exact role match
    let hasRole = false;
    
    // Compare string values
    if (userRole === requiredRole) {
      hasRole = true;
    } else if (requiredRole === UserRole.CLIENT && userRole === 'user') {
      // User role can access client routes
      hasRole = true;
    }
    
    setHasAccess(hasRole);
  }, [user, requiredRole]);

  if (loading || hasAccess === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary mr-2" />
        <span>Vérification des autorisations...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate auth page based on required role
    if (requiredRole === UserRole.SUPER_ADMIN || requiredRole === UserRole.ADMIN) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requiredRole === UserRole.SFD_ADMIN) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
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
          requiredRole 
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
