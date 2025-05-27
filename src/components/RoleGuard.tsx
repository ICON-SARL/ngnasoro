
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
      console.log(`RoleGuard: Checking database for role: '${role}' for user ${userId}`);
      
      const roleString = role.toLowerCase();
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('RoleGuard: Error checking user role:', error);
        return false;
      }
      
      console.log('RoleGuard: Database roles found:', data);
      
      // Check if any of the returned roles match the required role
      const hasExactRole = data.some(r => r.role.toLowerCase() === roleString);
      // For admin access, also check if user has 'admin' role
      const hasAdminRole = roleString === 'admin' && data.some(r => r.role.toLowerCase() === 'admin');
      
      const result = hasExactRole || hasAdminRole;
      console.log('RoleGuard: Database check result:', { 
        hasExactRole, 
        hasAdminRole, 
        finalResult: result 
      });
      
      return result;
    } catch (err) {
      console.error('RoleGuard: Error in checkRoleInDatabase:', err);
      return false;
    }
  };
  
  // Check for role from session storage
  const getStoredRole = (): string | null => {
    return sessionStorage.getItem('user_role');
  };

  useEffect(() => {
    const checkAccess = async () => {
      console.log('RoleGuard: Starting access check', {
        loading,
        user: !!user,
        userRole,
        requiredRole,
        path: location.pathname
      });

      // Default to no access
      let access = false;
      
      // If not loading and we have a user, check role
      if (!loading && user) {
        console.log('RoleGuard: Checking access for:', { 
          userRole,
          requiredRole,
          path: location.pathname,
          metadata: user.app_metadata
        });
        
        // Convert requiredRole to string for comparison
        const requiredRoleStr = String(requiredRole).toLowerCase();
        
        // 1. Check from auth context (userRole from useAuth)
        if (userRole !== null) {
          const userRoleStr = String(userRole).toLowerCase();
          console.log(`RoleGuard: Comparing user role '${userRoleStr}' with required role '${requiredRoleStr}'`);
          
          if (userRoleStr === requiredRoleStr) {
            console.log('RoleGuard: Access granted via auth context exact match');
            access = true;
          }
          // Special case for admin access
          else if (requiredRoleStr === 'admin' && userRoleStr === 'admin') {
            console.log('RoleGuard: Access granted via admin role match');
            access = true;
          }
        }
        
        // 2. Check from user metadata
        if (!access && user.app_metadata?.role) {
          const metadataRole = String(user.app_metadata.role).toLowerCase();
          console.log('RoleGuard: Checking metadata role:', metadataRole);
          
          if (metadataRole === requiredRoleStr) {
            console.log('RoleGuard: Access granted via app_metadata');
            access = true;
          }
          // Special case for admin in metadata
          else if (requiredRoleStr === 'admin' && metadataRole === 'admin') {
            console.log('RoleGuard: Access granted via metadata admin role');
            access = true;
          }
        }
        
        // 3. Check from session storage
        if (!access) {
          const storedRole = getStoredRole()?.toLowerCase();
          console.log('RoleGuard: Checking stored role:', storedRole);
          
          if (storedRole === requiredRoleStr) {
            console.log('RoleGuard: Access granted via session storage');
            access = true;
          }
          // Special case for admin in storage
          else if (requiredRoleStr === 'admin' && storedRole === 'admin') {
            console.log('RoleGuard: Access granted via stored admin role');
            access = true;
          }
        }
        
        // 4. Check from database (most reliable but slowest)
        if (!access) {
          console.log('RoleGuard: Checking database as final fallback');
          const dbResult = await checkRoleInDatabase(user.id, requiredRoleStr);
          if (dbResult) {
            console.log('RoleGuard: Access granted via database check');
            // Store for future checks
            sessionStorage.setItem('user_role', requiredRoleStr);
            access = true;
          }
        }
        
        console.log(`RoleGuard: Final access decision for ${requiredRole}: ${access}`);
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
    console.log('RoleGuard: No user found, redirecting to auth');
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
    console.log('RoleGuard: Access denied, logging event');
    
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
    
    console.log(`RoleGuard: Access denied - redirecting to ${fallbackPath}`, {
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

  console.log('RoleGuard: Access granted, rendering children');
  return <>{children}</>;
};

export default RoleGuard;
