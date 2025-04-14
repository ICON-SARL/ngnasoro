
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
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
    if (isAdmin) {
      setHasAccess(true);
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
          normalized_user_role: normalizedUserRole,
          normalized_required_role: normalizedRequiredRole,
          timestamp: new Date().toISOString()
        },
        error_message: `Access denied: Missing role (${requiredRole})`
      }).catch(err => console.error('Error logging audit event:', err));
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
        to="/login" 
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
