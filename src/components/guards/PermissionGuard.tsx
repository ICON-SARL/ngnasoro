
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { PERMISSIONS } from '@/utils/auth/roles';
import { Loader2, ShieldOff } from 'lucide-react';

interface PermissionGuardProps {
  requiredPermission: string | string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  requiredPermission, 
  children, 
  fallbackPath = '/access-denied'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { userPermissions, isAdmin, loading: permissionLoading } = usePermissions();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();
  
  const loading = authLoading || permissionLoading;
  
  useEffect(() => {
    if (loading) return;
    
    // Check if user exists in the auth context
    if (!user) {
      setHasAccess(false);
      return;
    }

    // Convert single permission to array for easier checking
    const requiredPermissions = Array.isArray(requiredPermission) 
      ? requiredPermission 
      : [requiredPermission];
    
    // Admin always has access
    if (isAdmin()) {
      setHasAccess(true);
      return;
    }
    
    // Check if user has all required permissions
    const permitted = requiredPermissions.every(perm => 
      userPermissions.includes(perm)
    );
    
    setHasAccess(permitted);
    
    // Log access denied attempts
    if (!permitted) {
      logAuditEvent({
        user_id: user.id,
        action: 'permission_check_failure',
        category: AuditLogCategory.DATA_ACCESS,
        severity: AuditLogSeverity.WARNING,
        status: 'failure',
        target_resource: location.pathname,
        details: {
          required_permissions: requiredPermissions,
          user_permissions: userPermissions,
          timestamp: new Date().toISOString()
        },
        error_message: `Accès refusé: Permission(s) requise(s) non trouvée(s)`
      }).catch(err => console.error('Error logging audit event:', err));
    }
  }, [user, userPermissions, requiredPermission, location.pathname, isAdmin, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51] mb-4" />
        <h2 className="text-xl font-medium text-gray-700 mb-2">Vérification des autorisations...</h2>
        <p className="text-sm text-gray-500">Veuillez patienter pendant que nous vérifions votre accès.</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return URL
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (hasAccess === false) {
    // Track the required permissions and original location for potential handling on the access denied page
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          requiredPermission: Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission],
          from: location.pathname 
        }} 
        replace 
      />
    );
  }

  // User has permission, render children
  return <>{children}</>;
};

export default PermissionGuard;
