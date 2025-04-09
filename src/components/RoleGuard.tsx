
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { UserRole } from '@/hooks/auth/types';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

interface RoleGuardProps {
  requiredRole: UserRole | string;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, children }) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if user exists in the auth context
    if (!user) {
      setHasAccess(false);
      return;
    }

    // Get role from user metadata
    const userRole = user.app_metadata?.role;
    
    // Debug log
    console.log('RoleGuard checking:', { 
      userRole, 
      requiredRole, 
      userMetadata: user.app_metadata 
    });
    
    // Handle special case where SFD_ADMIN should match sfd_admin role
    const permitted = userRole === requiredRole || 
      (requiredRole === 'sfd_admin' && userRole === 'sfd_admin') ||
      (requiredRole === UserRole.SFD_ADMIN && userRole === 'sfd_admin') ||
      (requiredRole === 'admin' && userRole === 'admin');
    
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
          required_role: requiredRole,
          user_role: userRole,
          timestamp: new Date().toISOString()
        },
        error_message: `Access denied: Missing role (${requiredRole})`
      }).catch(err => console.error('Error logging audit event:', err));
    }
  }, [user, requiredRole, location.pathname]);

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
