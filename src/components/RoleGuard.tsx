
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { UserRole } from '@/hooks/auth/types';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  requiredRole: UserRole | string;
  children: React.ReactNode;
  fallbackPath?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  requiredRole, 
  children, 
  fallbackPath = '/access-denied'
}) => {
  const { user, loading, userRole, isCheckingRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      console.log('RoleGuard: Starting access check', {
        loading,
        isCheckingRole,
        user: !!user,
        userRole,
        requiredRole,
        path: location.pathname
      });

      if (!loading && !isCheckingRole) {
        if (!user) {
          console.log('RoleGuard: No user found');
          setHasAccess(false);
          return;
        }

        const requiredRoleStr = String(requiredRole).toLowerCase();
        const userRoleStr = String(userRole).toLowerCase();
        
        console.log('RoleGuard: Role comparison', {
          userRole: userRoleStr,
          requiredRole: requiredRoleStr,
          match: userRoleStr === requiredRoleStr
        });
        
        const hasRole = userRoleStr === requiredRoleStr;
        setHasAccess(hasRole);
        
        if (!hasRole) {
          console.log('RoleGuard: Access denied, logging event');
          logAuditEvent(
            AuditLogCategory.DATA_ACCESS,
            'role_access_denied',
            {
              required_role: requiredRole,
              user_role: userRole || 'unknown',
              path: location.pathname
            },
            user.id,
            AuditLogSeverity.WARNING,
            'failure'
          ).catch(e => console.error('Error logging audit event:', e));
        }
      }
    };
    
    checkAccess();
  }, [user, loading, isCheckingRole, userRole, requiredRole, location.pathname]);

  // Still loading auth or checking role
  if (loading || isCheckingRole || hasAccess === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-primary mr-2" />
        <span>Vérification des autorisations...</span>
      </div>
    );
  }

  // No user at all - redirect to auth
  if (!user) {
    console.log('RoleGuard: No user found, redirecting to auth');
    return (
      <Navigate 
        to="/auth" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // User exists but doesn't have required role
  if (!hasAccess) {
    console.log(`RoleGuard: Access denied - redirecting to ${fallbackPath}`, {
      requiredRole,
      userRole: userRole || 'unknown'
    });
    
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          from: location.pathname,
          requiredRole 
        }} 
        replace 
      />
    );
  }

  console.log('RoleGuard: Access granted, rendering children');
  return <>{children}</>;
};

export default RoleGuard;
