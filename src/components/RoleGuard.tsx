
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
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, children }) => {
  const { user, loading, isAdmin, isSfdAdmin, isClient, userRole } = useAuth();
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
      isAdmin,
      isSfdAdmin,
      isClient,
      userMetadata: user.app_metadata,
      path: location.pathname
    });
    
    // Super admins have access to everything
    if (isAdmin && requiredRole === UserRole.SuperAdmin) {
      setHasAccess(true);
      return;
    }
    
    // Check for specific role restrictions
    if (requiredRole === UserRole.Client && (isAdmin || isSfdAdmin)) {
      console.log('Admin/SFD admin cannot access client routes');
      setHasAccess(false);
      return;
    }

    if (requiredRole === UserRole.SfdAdmin && isAdmin) {
      console.log('Admin cannot access SFD admin routes');
      setHasAccess(false);
      return;
    }
    
    // Map string roles to the enum for consistency
    const normalizeRole = (role: string | UserRole): string => {
      if (typeof role === 'string') {
        return role.toLowerCase();
      }
      return String(role).toLowerCase();
    };
    
    const normalizedRequiredRole = normalizeRole(requiredRole);
    const normalizedUserRole = normalizeRole(userRole);
    
    // Check for exact role match or special cases
    const permitted = 
      normalizedUserRole === normalizedRequiredRole ||
      (normalizedRequiredRole === 'admin' && isAdmin) ||
      (normalizedRequiredRole === 'sfd_admin' && isSfdAdmin) ||
      (normalizedRequiredRole === 'user' && isClient) ||
      (normalizedRequiredRole === 'client' && isClient);
    
    setHasAccess(permitted);
    
    // Log access denied attempts
    if (!permitted) {
      // Fix: Update this call to match the expected number of arguments
      logAuditEvent({
        category: AuditLogCategory.DATA_ACCESS,
        action: 'role_check_failure',
        details: {
          required_role: requiredRole,
          user_role: userRole,
          normalized_user_role: normalizedUserRole,
          normalized_required_role: normalizedRequiredRole,
          timestamp: new Date().toISOString()
        },
        user_id: user.id,
        severity: AuditLogSeverity.WARNING,
        status: 'failure',
        resource: location.pathname,
        message: `Access denied: Missing role (${requiredRole})`
      });
    }
  }, [user, requiredRole, location.pathname, userRole, isAdmin, isSfdAdmin, isClient]);

  if (loading || hasAccess === null) {
    // Still checking permissions
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-primary mr-2" />
        <span>Vérification des autorisations...</span>
      </div>
    );
  }

  if (!user) {
    // User not authenticated, redirect to login
    return (
      <Navigate 
        to="/auth" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
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
