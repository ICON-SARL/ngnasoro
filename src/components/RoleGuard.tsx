
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
      const currentTime = new Date().toISOString();
      const debug = `[${currentTime}] RoleGuard: Starting access check`;
      
      console.log(debug, {
        loading,
        isCheckingRole,
        user: !!user,
        userRole,
        requiredRole,
        path: location.pathname
      });

      setDebugInfo(debug);

      // Timeout de secours : si après 10 secondes on est toujours en loading
      timeoutId = setTimeout(() => {
        if (loading || isCheckingRole || hasAccess === null) {
          console.error('RoleGuard timeout - redirecting to auth');
          setHasAccess(false);
        }
      }, 10000);

      if (loading || isCheckingRole) {
        console.log('RoleGuard: Still loading...');
        return;
      }

      if (!user) {
        console.log('RoleGuard: No user found, denying access');
        setHasAccess(false);
        return;
      }

      const requiredRoleStr = String(requiredRole).toLowerCase();
      const userRoleStr = String(userRole).toLowerCase();
      
      console.log('RoleGuard: Role comparison', {
        userRole: userRoleStr,
        requiredRole: requiredRoleStr,
        match: userRoleStr === requiredRoleStr,
        userMetadata: user.app_metadata
      });
      
      const hasRole = userRoleStr === requiredRoleStr;
      setHasAccess(hasRole);
      
      if (!hasRole) {
        console.log('RoleGuard: Access denied, logging event');
        try {
          await logAuditEvent(
            AuditLogCategory.DATA_ACCESS,
            'role_access_denied',
            {
              required_role: requiredRole,
              user_role: userRole || 'unknown',
              path: location.pathname,
              user_metadata: user.app_metadata,
              timestamp: currentTime
            },
            user.id,
            AuditLogSeverity.WARNING,
            'failure'
          );
        } catch (e) {
          console.error('Error logging audit event:', e);
        }
      } else {
        console.log('RoleGuard: Access granted for user', {
          userId: user.id,
          email: user.email,
          role: userRole
        });
      }
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
