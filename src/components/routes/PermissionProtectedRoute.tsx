
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { logPermissionFailure } from '@/utils/audit';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/utils/auth/roleTypes';

interface PermissionProtectedRouteProps {
  component: React.ComponentType<any>;
  requiredPermission?: string;
  requiredRole?: UserRole;
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
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();
  
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
    if (userRole === UserRole.ADMIN) {
      console.log('Admin detected, granting access');
      setHasAccess(true);
      return;
    }
    
    // Fix for SFD_ADMIN role and manage_subsidies permission
    if (userRole === UserRole.SFD_ADMIN && (
      requiredRole === UserRole.SFD_ADMIN || requiredPermission === 'manage_subsidies'
    )) {
      console.log('SFD admin accessing subsidies, granting access');
      setHasAccess(true);
      return;
    }
    
    // Fix for SFD_ADMIN matching sfd_admin string value
    let roleMatch = !requiredRole || 
      userRole === requiredRole || 
      (requiredRole === UserRole.SFD_ADMIN && userRole === UserRole.SFD_ADMIN);
    
    // Check permissions - comparing string value with string value
    let permissionMatch = !requiredPermission || userRole === 'admin';
    
    // SFD admin has SFD-related permissions
    if (!permissionMatch && userRole === UserRole.SFD_ADMIN && requiredPermission && 
        (requiredPermission.includes('sfd') || 
         requiredPermission.includes('client') || 
         requiredPermission.includes('loan'))) {
      permissionMatch = true;
    }
    
    console.log('Permission protected route check result:', { 
      userRole, 
      requiredRole, 
      requiredPermission,
      roleMatch,
      permissionMatch,
      path: location.pathname
    });
    
    const permitted = roleMatch && permissionMatch;
    setHasAccess(permitted);
    
    // Log access denied attempts if needed
    if (!permitted && user) {
      if (requiredPermission && !permissionMatch) {
        logPermissionFailure(user.id, requiredPermission, location.pathname);
      }
      if (requiredRole && !roleMatch) {
        logPermissionFailure(user.id, `role:${requiredRole}`, location.pathname);
      }
    }
  }, [user, requiredPermission, requiredRole, location.pathname]);
  
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
    } else if (requiredRole === UserRole.SFD_ADMIN) {
      return <Navigate to="/sfd/auth" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }
  
  if (!hasAccess) {
    return <Navigate to="/access-denied" state={{ from: location, requiredPermission, requiredRole }} replace />;
  }

  return <Component {...rest} />;
};

export default PermissionProtectedRoute;
