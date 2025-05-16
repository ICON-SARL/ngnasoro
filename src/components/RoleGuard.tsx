
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

  // Function to check for role in database
  const checkRoleInDatabase = async (userId: string, role: string): Promise<boolean> => {
    try {
      console.log(`Checking database for role: '${role}' for user ${userId}`);
      
      // Convert role to string and lowercase for consistency in database queries
      const roleString = role.toLowerCase();
      
      // Use a direct query approach
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error checking user role:', error);
        return false;
      }
      
      console.log('Database roles found:', data);
      
      // Check if any of the returned roles match the required role
      return data.some(r => r.role.toLowerCase() === roleString);
    } catch (err) {
      console.error('Error in checkRoleInDatabase:', err);
      return false;
    }
  };
  
  // Check for role from session storage (for persistence)
  const getStoredRole = (): string | null => {
    return sessionStorage.getItem('user_role');
  };

  useEffect(() => {
    const checkAccess = async () => {
      // Default to no access
      let access = false;
      
      // If not loading and we have a user, check role
      if (!loading && user) {
        console.log('RoleGuard checking access for:', { 
          userRole,
          requiredRole,
          path: location.pathname,
          metadata: user.app_metadata
        });
        
        // Convert requiredRole to string for comparison
        const requiredRoleStr = String(requiredRole).toLowerCase();
        
        // 1. Check from auth context
        if (userRole !== null) {
          const userRoleStr = String(userRole).toLowerCase();
          console.log(`Comparing user role '${userRoleStr}' with required role '${requiredRoleStr}'`);
          if (userRoleStr === requiredRoleStr) {
            access = true;
          }
        }
        // 2. Check from user metadata
        else if (user.app_metadata?.role && String(user.app_metadata.role).toLowerCase() === requiredRoleStr) {
          console.log('Access granted via app_metadata');
          access = true;
        }
        // 3. Check from session storage (for persistence)
        else if (getStoredRole()?.toLowerCase() === requiredRoleStr) {
          console.log('Access granted via session storage');
          access = true;
        }
        // 4. Check from database (most reliable but slowest)
        else if (await checkRoleInDatabase(user.id, requiredRoleStr)) {
          console.log('Access granted via database check');
          // If found in database, store for future checks
          sessionStorage.setItem('user_role', requiredRoleStr);
          access = true;
        }
        
        console.log(`Final access decision for ${requiredRole}: ${access}`);
      }
      
      setHasAccess(access);
      setIsCheckingRole(false);
    };
    
    checkAccess();
  }, [user, loading, requiredRole, userRole, location.pathname]);

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
    return (
      <Navigate 
        to={`/auth`} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // User exists but doesn't have required role
  if (user && !hasAccess) {
    // Log access attempt
    logAuditEvent(
      AuditLogCategory.DATA_ACCESS,
      'role_access_denied',
      {
        required_role: requiredRole,
        user_role: userRole || user.app_metadata?.role || 'unknown',
        path: location.pathname
      },
      user.id,
      AuditLogSeverity.WARNING,
      'failure'
    ).catch(e => console.error('Error logging audit event:', e));
    
    console.log(`Access denied - redirecting to ${fallbackPath}`, {
      requiredRole,
      userRole: userRole || user.app_metadata?.role || 'unknown'
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

  // User has the required role or is admin
  return <>{children}</>;
};

export default RoleGuard;
