
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
    
    // Map string roles to equivalent values for consistency
    const normalizeRole = (role: string | UserRole): string => {
      if (typeof role === 'string') {
        return role.toLowerCase();
      }
      return String(role).toLowerCase();
    };
    
    const normalizedRequiredRole = normalizeRole(requiredRole);
    const normalizedUserRole = normalizeRole(userRole);
    
    // Super admins have access to everything except specific client routes
    if (isAdmin) {
      if (normalizedRequiredRole === 'client') {
        // Admins can't access client-only routes
        setHasAccess(false);
      } else {
        // Admins can access everything else
        setHasAccess(true);
      }
      return;
    }
    
    // SFD admins can access their specific routes and certain shared routes
    if (isSfdAdmin && (
      normalizedRequiredRole === 'sfd_admin' ||
      normalizedRequiredRole === 'sfd_user'
    )) {
      setHasAccess(true);
      return;
    }
    
    // Clients can only access client routes
    if (isClient && (
      normalizedRequiredRole === 'client' ||
      normalizedRequiredRole === 'user'
    )) {
      setHasAccess(true);
      return;
    }
    
    // Allow users with 'user' role to access client pages for registration process
    if (normalizedUserRole === 'user' && (
      normalizedRequiredRole === 'client'
    )) {
      setHasAccess(true);
      return;
    }
    
    // Check for exact role match
    const permitted = normalizedUserRole === normalizedRequiredRole;
    
    setHasAccess(permitted);
    
    // Log access denied attempts
    if (!permitted) {
      logAuditEvent(
        AuditLogCategory.DATA_ACCESS,
        'role_check_failure',
        {
          required_role: requiredRole,
          user_role: userRole,
          normalized_user_role: normalizedUserRole,
          normalized_required_role: normalizedRequiredRole,
          timestamp: new Date().toISOString()
        },
        user.id,
        AuditLogSeverity.WARNING,
        'failure'
      ).catch(err => console.error('Error logging audit event:', err));
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

  // Don't redirect if on agency-dashboard - this prevents the infinite redirect loop
  if (!hasAccess && location.pathname !== '/agency-dashboard') {
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

  // User has permission or is on agency-dashboard, render children
  return <>{children}</>;
};

export default RoleGuard;
