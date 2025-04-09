
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { UserRole } from '@/utils/auth/roleTypes';

interface RoleGuardProps {
  requiredRole: UserRole | string; // Allow both enum and string for flexibility
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, children }) => {
  const { user, userRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if user exists in the auth context
    if (!user) {
      setHasAccess(false);
      return;
    }

    console.log('RoleGuard checking:', { 
      userRole, 
      requiredRole,
      userMetadata: user.app_metadata 
    });
    
    // Super admin et admin ont accès à tout
    if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
      console.log('Access granted: User is admin or super_admin');
      setHasAccess(true);
      return;
    }
    
    // Handle case where userRole matches requiredRole
    // Convert to strings for comparison to avoid type issues
    const userRoleStr = String(userRole);
    const requiredRoleStr = String(requiredRole);
    
    const permitted = userRoleStr === requiredRoleStr;
    
    console.log('Access check result:', { userRoleStr, requiredRoleStr, permitted });
    setHasAccess(permitted);
    
    // Log access denied attempts
    if (!permitted) {
      logAuditEvent({
        user_id: user.id,
        action: 'role_check_failure',
        category: AuditLogCategory.DATA_ACCESS,
        severity: AuditLogSeverity.WARNING,
        status: 'failure',
        target_resource: location.pathname,
        details: {
          required_role: requiredRoleStr,
          user_role: userRoleStr,
          timestamp: new Date().toISOString()
        },
        error_message: `Access denied: Missing role (${requiredRoleStr})`
      }).catch(err => console.error('Error logging audit event:', err));
    }
  }, [user, userRole, requiredRole, location.pathname]);

  if (hasAccess === null) {
    // Still checking permissions
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Vérification des autorisations...</span>
    </div>;
  }

  if (!user) {
    // User not authenticated, redirect to login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    // User doesn't have the required role, redirect to access denied
    return (
      <Navigate 
        to="/access-denied" 
        state={{ 
          requiredRole,
          from: location.pathname 
        }} 
        replace 
      />
    );
  }

  // User has permission, render children
  return <>{children}</>;
};

export default RoleGuard;
