
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
  const { user, hasPermission } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }

      try {
        const permitted = await hasPermission(requiredPermission);
        setHasAccess(permitted);
        
        // Log access denied attempts
        if (!permitted) {
          await logAuditEvent({
            user_id: user.id,
            action: 'permission_check_failure',
            category: AuditLogCategory.DATA_ACCESS,
            severity: AuditLogSeverity.WARNING,
            status: 'failure',
            target_resource: location.pathname,
            details: {
              required_permission: requiredPermission,
              timestamp: new Date().toISOString()
            },
            error_message: `Access denied: Missing permission (${requiredPermission})`
          });
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [user, requiredPermission, hasPermission, location.pathname]);

  if (hasAccess === null) {
    // Still checking permissions
    return <div>Vérification des autorisations...</div>;
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
