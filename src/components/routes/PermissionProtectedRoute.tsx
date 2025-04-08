
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { logPermissionFailure } from '@/utils/audit';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/utils/auth/roleTypes';

interface PermissionProtectedRouteProps {
  component: React.ComponentType<any>;
  requiredPermission?: string;
  requiredRole?: UserRole | string;
  fallbackPath?: string;
  [x: string]: any;
}

const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({ 
  component: Component, 
  requiredPermission,
  requiredRole,
  fallbackPath = '/login',
  ...rest 
}) => {
  const { user, isAdmin, isSfdAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();
  
  // Ne pas rediriger depuis la page d'accueil
  if (location.pathname === '/' || location.pathname === '/index') {
    return <Component {...rest} />;
  }
  
  useEffect(() => {
    // If no user, deny access immediately
    if (!user) {
      setHasAccess(false);
      return;
    }

    // Get role from user metadata
    const userRole = user.app_metadata?.role;
    
    console.log('PermissionProtectedRoute checking:', { 
      userRole, 
      requiredRole, 
      requiredPermission,
      userMetadata: user.app_metadata,
      path: location.pathname
    });
    
    // Check for admin access (admin has access to everything)
    if (isAdmin || (userRole && userRole === 'admin')) {
      console.log('Admin detected, granting access');
      setHasAccess(true);
      return;
    }
    
    // SFD admin access check - direct string comparison for clarity
    if ((isSfdAdmin || (userRole && userRole === 'sfd_admin')) && (
      requiredRole === UserRole.SFD_ADMIN || 
      requiredRole === 'sfd_admin' ||
      requiredPermission === 'manage_subsidies'
    )) {
      console.log('SFD admin accessing appropriate resource, granting access');
      setHasAccess(true);
      return;
    }
    
    // Role comparison - reliable string comparison
    let roleMatch = false;
    
    if (!requiredRole) {
      roleMatch = true;
    } else if (typeof requiredRole === 'string') {
      // Safe comparison with type assertion
      roleMatch = userRole === requiredRole;
    } else {
      // Fixed: Convert enum value to string for comparison
      const requiredRoleString = String(requiredRole);
      roleMatch = Boolean(userRole && userRole === requiredRoleString);
    }
    
    // Permission check
    let permissionMatch = !requiredPermission;
    
    // Admin has all permissions
    if (isAdmin || (userRole && typeof userRole === 'string' && userRole === 'admin')) {
      permissionMatch = true;
    }
    
    // SFD admin has SFD-related permissions
    if (!permissionMatch && 
        (isSfdAdmin || (userRole && userRole === 'sfd_admin')) && 
        requiredPermission && 
        (requiredPermission.includes('sfd') || 
         requiredPermission.includes('client') || 
         requiredPermission.includes('loan'))) {
      permissionMatch = true;
    }
    
    console.log('Permission check result:', { 
      userRole, 
      requiredRole, 
      requiredPermission,
      roleMatch,
      permissionMatch
    });
    
    const permitted = roleMatch && permissionMatch;
    setHasAccess(permitted);
    
    // Log access denied attempts if needed
    if (!permitted && user) {
      if (requiredPermission && !permissionMatch) {
        logPermissionFailure(user.id, requiredPermission, location.pathname);
      }
      if (requiredRole && !roleMatch) {
        const roleValue = typeof requiredRole === 'string' 
          ? requiredRole
          : String(requiredRole);
        logPermissionFailure(user.id, `role:${roleValue}`, location.pathname);
      }
    }
  }, [user, requiredPermission, requiredRole, location.pathname, isAdmin, isSfdAdmin]);
  
  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des permissions...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate auth page based on required role
    if (requiredRole === UserRole.SUPER_ADMIN) {
      return <Navigate to="/admin/auth" state={{ from: location }} replace />;
    } else if (requiredRole === UserRole.SFD_ADMIN || requiredRole === 'sfd_admin') {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }
  
  if (!hasAccess) {
    return <Navigate to={fallbackPath || "/access-denied"} state={{ from: location, requiredPermission, requiredRole }} replace />;
  }

  return <Component {...rest} />;
};

export default PermissionProtectedRoute;
