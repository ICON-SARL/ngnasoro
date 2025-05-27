
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { UserRole } from '@/hooks/auth/types';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const { user, loading, userRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      console.log('RoleGuard: Starting access check', {
        loading,
        user: !!user,
        userRole,
        requiredRole,
        path: location.pathname
      });

      if (!loading && user) {
        try {
          // Use database as single source of truth
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          
          if (error) {
            console.error('RoleGuard: Error checking user role:', error);
            setHasAccess(false);
            setIsCheckingRole(false);
            return;
          }
          
          console.log('RoleGuard: Database roles found:', userRoles);
          
          const requiredRoleStr = String(requiredRole).toLowerCase();
          const hasRole = userRoles.some(r => r.role === requiredRoleStr);
          
          console.log(`RoleGuard: Access check result for ${requiredRole}: ${hasRole}`);
          setHasAccess(hasRole);
        } catch (err) {
          console.error('RoleGuard: Error in access check:', err);
          setHasAccess(false);
        }
      } else if (!loading && !user) {
        setHasAccess(false);
      }
      
      setIsCheckingRole(false);
    };
    
    checkAccess();
  }, [user, loading, requiredRole, location.pathname]);

  // Still loading auth or checking role
  if (loading || isCheckingRole) {
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
        to={`/sfd/auth`} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // User exists but doesn't have required role
  if (user && !hasAccess) {
    console.log('RoleGuard: Access denied, logging event');
    
    // Log access attempt
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
