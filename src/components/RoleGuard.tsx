
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkAccess = async () => {
      console.log('🔐 RoleGuard - Detailed Check:', { 
        path: location.pathname,
        userId: user?.id,
        userEmail: user?.email,
        loading, 
        isCheckingRole,
        userRole,
        userRoleType: typeof userRole,
        userRoleIsNull: userRole === null,
        requiredRole,
        requiredRoleType: typeof requiredRole
      });

      // Wait for initial auth loading
      if (loading) {
        console.log('⏳ RoleGuard - Still loading auth state...');
        return;
      }

      // No user means redirect to auth
      if (!user) {
        console.log('❌ RoleGuard - No user, redirecting to auth');
        setHasAccess(false);
        return;
      }

      // CRITICAL: Wait for role to be loaded (don't proceed if role is being checked OR is null)
      if (isCheckingRole || userRole === null) {
        console.log('⏳ RoleGuard - Waiting for role to load...', { isCheckingRole, userRole });
        
        // Security timeout: if still waiting after 10 seconds, deny access
        timeoutId = setTimeout(() => {
          console.error('⚠️ RoleGuard - Timeout waiting for role, denying access');
          setHasAccess(false);
        }, 10000);
        
        return;
      }

      // Clear timeout if we got here
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Role hierarchy - support_admin can access everything
      const ROLE_HIERARCHY: Record<string, number> = {
        'support_admin': 5,
        'admin': 4,
        'sfd_admin': 3,
        'client': 2,
        'user': 1
      };

      const requiredRoleStr = String(requiredRole).toLowerCase();
      const userRoleStr = String(userRole).toLowerCase();
      
      const userPriority = ROLE_HIERARCHY[userRoleStr] || 0;
      const requiredPriority = ROLE_HIERARCHY[requiredRoleStr] || 0;
      
      // support_admin bypasses all checks; otherwise exact match or hierarchy
      const hasRole = userRoleStr === 'support_admin' || userRoleStr === requiredRoleStr;
      
      if (!hasRole) {
        console.log('❌ RoleGuard - Access denied, logging audit event');
        
        // Log access denial
        try {
          await logAuditEvent(
            AuditLogCategory.DATA_ACCESS,
            'role_access_denied',
            {
              required_role: requiredRole,
              user_role: userRole,
              path: location.pathname,
              timestamp: new Date().toISOString()
            },
            user.id,
            AuditLogSeverity.WARNING,
            'failure'
          );
        } catch (e) {
          console.error('Error logging audit event:', e);
        }
        
        setHasAccess(false);
        return;
      }

      console.log('✅ RoleGuard - Access granted for user:', {
        userId: user.id,
        email: user.email,
        role: userRole
      });
      setHasAccess(true);
    };
    
    checkAccess();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, loading, isCheckingRole, userRole, requiredRole, location.pathname]);

  // Still loading auth or checking role
  if (loading || isCheckingRole || hasAccess === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-primary mr-2" />
        <span className="text-lg font-medium">Vérification des autorisations...</span>
        {debugInfo && (
          <div className="mt-4 text-xs text-gray-500 max-w-md text-center">
            <p>Debug: {debugInfo}</p>
            <p>Rôle requis: {requiredRole}</p>
            <p>Rôle utilisateur: {userRole || 'en cours...'}</p>
          </div>
        )}
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
      userRole: userRole || 'unknown',
      userId: user.id,
      email: user.email
    });
    
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          from: location.pathname,
          requiredRole,
          userRole,
          userId: user.id
        }} 
        replace 
      />
    );
  }

  console.log('RoleGuard: Access granted, rendering children');
  return <>{children}</>;
};

export default RoleGuard;
