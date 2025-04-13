
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { UserRole } from '@/hooks/auth/types';

interface RoleGuardProps {
  requiredRole: UserRole | string;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if user exists in the auth context
    if (!user) {
      setHasAccess(false);
      return;
    }

    // Get role from user metadata
    const userRole = user.app_metadata?.role || 'user'; // Default to 'user' if role is not set
    
    // Debug log
    console.log('RoleGuard checking:', { 
      userRole, 
      requiredRole, 
      userMetadata: user.app_metadata,
      userObject: user
    });
    
    // Handle mapping between app_metadata roles and database roles
    // client in app_metadata maps to user in database
    const getMappedRole = (role: string): string => {
      return role.toLowerCase() === 'client' ? 'user' : role.toLowerCase();
    };
    
    // Handle special case where SFD_ADMIN should match sfd_admin role
    // and convert both to lowercase for comparison
    const userRoleLower = getMappedRole(String(userRole));
    const requiredRoleLower = getMappedRole(String(requiredRole));
    
    const permitted = 
      userRoleLower === requiredRoleLower || 
      (requiredRoleLower === 'sfd_admin' && userRoleLower === 'sfd_admin') ||
      (requiredRoleLower === 'user' && userRoleLower === 'user') ||
      (requiredRoleLower === 'client' && userRoleLower === 'user') ||
      (requiredRoleLower === 'admin' && userRoleLower === 'admin') ||
      // Accept all roles by super admin
      userRoleLower === 'admin';
    
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
          mapped_user_role: userRoleLower,
          timestamp: new Date().toISOString()
        },
        error_message: `Access denied: Missing role (${requiredRole})`
      }).catch(err => console.error('Error logging audit event:', err));
    }
  }, [user, requiredRole, location.pathname]);

  if (loading || hasAccess === null) {
    // Still checking permissions
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Vérification des autorisations...</span>
    </div>;
  }

  if (!user) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
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
