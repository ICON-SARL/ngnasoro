
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Permission } from '@/utils/audit/auditPermissions';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

interface PermissionGuardProps {
  requiredPermission: Permission;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ requiredPermission, children }) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // If no user, deny access immediately
    if (!user) {
      setHasAccess(false);
      return;
    }

    // Simple permission check based on user role
    const userRole = user.app_metadata?.role;
    
    console.log('PermissionGuard checking:', { 
      userRole, 
      requiredPermission,
      userMetadata: user.app_metadata 
    });
    
    let permitted = false;
    
    // Super admin has all permissions
    if (userRole === 'admin') {
      permitted = true;
    } 
    // SFD admin has SFD-related permissions
    else if (userRole === 'sfd_admin' && 
        (requiredPermission.includes('sfd') || 
         requiredPermission.includes('client') || 
         requiredPermission.includes('loan'))) {
      permitted = true;
    }
    
    console.log('Permission check result:', { 
      userRole, 
      requiredPermission, 
      permitted 
    });
    
    setHasAccess(permitted);
    
    // Log access denied attempts
    if (!permitted) {
      logAuditEvent({
        user_id: user.id,
        action: 'permission_check_failure',
        category: AuditLogCategory.DATA_ACCESS,
        severity: AuditLogSeverity.WARNING,
        status: 'failure',
        target_resource: location.pathname,
        details: {
          required_permission: requiredPermission,
          user_role: userRole,
          timestamp: new Date().toISOString()
        },
        error_message: `Access denied: Missing permission (${requiredPermission})`
      }).catch(err => console.error('Error logging audit event:', err));
    }
  }, [user, requiredPermission, location.pathname]);

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
    // User doesn't have the required permission, redirect to access denied
    return (
      <Navigate 
        to="/access-denied" 
        state={{ 
          requiredPermission,
          from: location.pathname 
        }} 
        replace 
      />
    );
  }

  // User has permission, render children
  return <>{children}</>;
};

export default PermissionGuard;
