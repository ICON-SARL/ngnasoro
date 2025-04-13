
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { UserRole } from '@/utils/auth/roles';
import { Loader2, ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  requiredRole: UserRole | UserRole[];
  children: React.ReactNode;
  fallbackPath?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  requiredRole, 
  children, 
  fallbackPath = '/access-denied'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { userRoles, loading: permissionLoading } = usePermissions();
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
    
    // Convert single role to array for easier checking
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Super Admin always has access
    if (userRoles.includes(UserRole.SUPER_ADMIN)) {
      setHasAccess(true);
      return;
    }
    
    // Check if user has any of the required roles
    const permitted = requiredRoles.some(role => userRoles.includes(role));
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
          required_roles: requiredRoles,
          user_roles: userRoles,
          timestamp: new Date().toISOString()
        },
        error_message: `Accès refusé: Rôle requis non trouvé`
      }).catch(err => console.error('Error logging audit event:', err));
    }
  }, [user, userRoles, requiredRole, location.pathname, loading]);

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
    // Track the required role and original location for potential handling on the access denied page
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          requiredRole: Array.isArray(requiredRole) ? requiredRole : [requiredRole],
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
