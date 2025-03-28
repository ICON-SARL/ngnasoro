
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from './auditLoggerCore';
import { AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';

// Enumeration for permission types
export enum Permission {
  // Super Admin permissions
  MANAGE_SFDS = 'manage_sfds',
  APPROVE_SUBSIDIES = 'approve_subsidies',
  MANAGE_ADMINS = 'manage_admins',
  VIEW_ALL_DATA = 'view_all_data',
  EXPORT_DATA = 'export_data',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  
  // SFD Admin permissions
  MANAGE_SFD_USERS = 'manage_sfd_users',
  MANAGE_CLIENTS = 'manage_sfd_clients',
  MANAGE_LOANS = 'manage_loans',
  REQUEST_SUBSIDIES = 'request_subsidies',
  VIEW_SFD_REPORTS = 'view_sfd_reports',
  
  // Client permissions
  VIEW_OWN_DATA = 'view_own_data',
  APPLY_FOR_LOANS = 'apply_for_loans',
  MANAGE_PROFILE = 'manage_profile'
}

// Enumeration for roles
export enum Role {
  SUPER_ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

// Function to check if a user has a specific role
export const hasRole = async (userId: string, role: Role): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('has_role', { 
        _user_id: userId, 
        _role: role as 'admin' | 'sfd_admin' | 'client' | 'user' // Use a more explicit type assertion that includes 'client'
      });
      
    if (error) throw error;
    return data as boolean;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Function to check if a user has a specific permission based on their role
export const hasPermission = async (userId: string, permission: Permission): Promise<boolean> => {
  try {
    // Get user roles
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    if (!userRoles || userRoles.length === 0) {
      return false;
    }
    
    // Super admin has all permissions
    if (userRoles.some(r => r.role === Role.SUPER_ADMIN)) {
      return true;
    }
    
    // Map roles to permissions
    const rolesToPermissions = {
      [Role.SUPER_ADMIN]: [
        Permission.MANAGE_SFDS,
        Permission.APPROVE_SUBSIDIES,
        Permission.MANAGE_ADMINS,
        Permission.VIEW_ALL_DATA,
        Permission.EXPORT_DATA,
        Permission.VIEW_AUDIT_LOGS
      ],
      [Role.SFD_ADMIN]: [
        Permission.MANAGE_SFD_USERS,
        Permission.MANAGE_CLIENTS,
        Permission.MANAGE_LOANS,
        Permission.REQUEST_SUBSIDIES,
        Permission.VIEW_SFD_REPORTS
      ],
      [Role.CLIENT]: [
        Permission.VIEW_OWN_DATA,
        Permission.APPLY_FOR_LOANS,
        Permission.MANAGE_PROFILE
      ],
      [Role.USER]: [
        Permission.VIEW_OWN_DATA,
        Permission.MANAGE_PROFILE
      ]
    };
    
    // Check if any of the user's roles have the requested permission
    return userRoles.some(r => {
      const rolePermissions = rolesToPermissions[r.role as Role];
      return rolePermissions && rolePermissions.includes(permission);
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Higher-order function to ensure a user has the required permission for an action
export const withPermission = (permission: Permission, location: string) => {
  return async (userId: string, action: () => Promise<any>) => {
    try {
      const hasAccess = await hasPermission(userId, permission);
      
      if (!hasAccess) {
        // Log the permission failure
        await logAuditEvent({
          user_id: userId,
          action: 'permission_check_failure',
          category: AuditLogCategory.DATA_ACCESS,
          severity: AuditLogSeverity.WARNING,
          status: 'failure',
          target_resource: location,
          details: {
            required_permission: permission,
            timestamp: new Date().toISOString()
          },
          error_message: `Access denied: Missing permission (${permission})`
        });
        
        throw new Error(`Access denied: Missing permission (${permission})`);
      }
      
      // Execute the action if the user has permission
      return await action();
    } catch (error) {
      console.error(`Error in withPermission (${permission}):`, error);
      throw error;
    }
  };
};

// Function to create a protected route component that checks permission
export const checkPermissionForRoute = async (
  userId: string, 
  permission: Permission, 
  navigate: (path: string) => void,
  location: string
) => {
  try {
    const hasAccess = await hasPermission(userId, permission);
    
    if (!hasAccess) {
      // Log the permission failure
      await logAuditEvent({
        user_id: userId,
        action: 'route_access_denied',
        category: AuditLogCategory.DATA_ACCESS,
        severity: AuditLogSeverity.WARNING,
        status: 'failure',
        target_resource: location,
        details: {
          required_permission: permission,
          timestamp: new Date().toISOString()
        },
        error_message: `Route access denied: Missing permission (${permission})`
      });
      
      // Redirect to access denied page with required permission
      navigate('/access-denied');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking permission for route (${permission}):`, error);
    
    // On error, redirect to access denied as a precaution
    navigate('/access-denied');
    return false;
  }
};
