
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Loader2 } from 'lucide-react';
import { permissionsService } from '@/services/auth/permissionsService';
import { logAuditEvent } from '@/utils/audit';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';

interface EnhancedPermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallbackPath?: string;
}

/**
 * Enhanced Permission Guard component that checks permissions in real-time
 */
const EnhancedPermissionGuard: React.FC<EnhancedPermissionGuardProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/access-denied'
}) => {
  const { user } = useAuth();
  const { hasPermission, loading: permissionsLoading } = useEnhancedPermissions();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkDirectPermission = async () => {
      // If no user or permissions still loading, wait
      if (!user || permissionsLoading) {
        return;
      }

      try {
        // Double-check permission directly from the server for security
        const permitted = await permissionsService.hasPermission(
          user.id,
          requiredPermission
        );

        setHasAccess(permitted);
        
        // Log access denied events for security auditing
        if (!permitted) {
          await logAuditEvent({
            user_id: user.id,
            action: 'permission_denied',
            category: AuditLogCategory.SECURITY,
            severity: AuditLogSeverity.WARNING,
            status: 'failure', 
            target_resource: location.pathname,
            details: {
              required_permission: requiredPermission,
              user_id: user.id,
              timestamp: new Date().toISOString()
            }
          });
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkDirectPermission();
  }, [user, requiredPermission, location.pathname, permissionsLoading]);

  // If still loading, show loading spinner
  if (checking || permissionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Vérification des autorisations...</span>
      </div>
    );
  }

  // If user not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // If user doesn't have permission, redirect to access denied
  if (!hasAccess) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          from: location.pathname,
          requiredPermission
        }} 
        replace 
      />
    );
  }

  // If user has permission, render children
  return <>{children}</>;
};

export default EnhancedPermissionGuard;
