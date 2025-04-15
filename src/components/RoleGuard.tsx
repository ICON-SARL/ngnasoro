
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
    
    // Convert requiredRole to string for consistent comparison
    const requiredRoleStr = String(requiredRole);
    
    // Super admins have access to everything except client routes
    if (userRole === 'admin') {
      if (requiredRoleStr === String(UserRole.CLIENT)) {
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }
      return;
    }
    
    // Check for exact role match
    let hasRole = false;
    
    // Compare string values instead of enum objects
    if (userRole === requiredRoleStr) {
      hasRole = true;
    } else if (requiredRoleStr === String(UserRole.CLIENT) && userRole === 'user') {
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
    const requiredRoleStr = String(requiredRole);
    
    if (requiredRoleStr === String(UserRole.SUPER_ADMIN) || requiredRoleStr === String(UserRole.ADMIN)) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requiredRoleStr === String(UserRole.SFD_ADMIN)) {
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
          requiredRole: String(requiredRole)
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
