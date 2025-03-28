
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Role } from '@/utils/audit/auditPermissions';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, children }) => {
  const { user, hasRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }

      try {
        const permitted = await hasRole(requiredRole);
        setHasAccess(permitted);
        
        // Log access denied attempts
        if (!permitted) {
          await logAuditEvent({
            user_id: user.id,
            action: 'role_check_failure',
            category: AuditLogCategory.DATA_ACCESS,
            severity: AuditLogSeverity.WARNING,
            status: 'failure',
            target_resource: location.pathname,
            details: {
              required_role: requiredRole,
              timestamp: new Date().toISOString()
            },
            error_message: `Access denied: Missing role (${requiredRole})`
          });
        }
      } catch (error) {
        console.error('Error checking role:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [user, requiredRole, hasRole, location.pathname]);

  if (hasAccess === null) {
    // Still checking permissions
    return <div>Vérification des autorisations...</div>;
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
