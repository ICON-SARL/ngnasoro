
import { supabase } from '@/integrations/supabase/client';
import { UserRole, PERMISSIONS } from '@/utils/auth/roleTypes';
import { logAuditEvent } from '@/utils/audit';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

/**
 * Detailed permissions service for managing fine-grained access control
 */
export const permissionsService = {
  /**
   * Check if a user has a specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // First check if user has admin role (admins have all permissions)
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (adminRole) {
        return true;
      }
      
      // Get all user roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (error || !userRoles?.length) {
        return false;
      }
      
      // Check if any role has the required permission
      return userRoles.some(({ role }) => {
        const roleEnum = role as UserRole;
        const rolePermissions = PERMISSIONS[roleEnum] || [];
        return rolePermissions.includes(permission);
      });
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },
  
  /**
   * Grant a specific permission to a user
   */
  async grantPermission(userId: string, permission: string, grantedBy: string): Promise<boolean> {
    try {
      // Check if the permission exists in our system
      const permissionExists = Object.values(PERMISSIONS).flat().includes(permission);
      if (!permissionExists) {
        console.error(`Permission ${permission} does not exist`);
        return false;
      }
      
      // Get current user permissions
      const { data: currentPermissions, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('permission', permission)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching current permissions:', error);
        return false;
      }
      
      // If permission already exists, do nothing
      if (currentPermissions) {
        return true;
      }
      
      // Add the permission
      const { error: insertError } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission: permission,
          granted_by: grantedBy,
          granted_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error granting permission:', insertError);
        return false;
      }
      
      // Log permission grant event
      await logAuditEvent({
        action: 'permission_granted',
        category: AuditLogCategory.SECURITY,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: grantedBy,
        target_resource: `user:${userId}`,
        details: {
          user_id: userId,
          permission: permission,
          granted_by: grantedBy
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error in grantPermission:', error);
      return false;
    }
  },
  
  /**
   * Revoke a specific permission from a user
   */
  async revokePermission(userId: string, permission: string, revokedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('permission', permission);
        
      if (error) {
        console.error('Error revoking permission:', error);
        return false;
      }
      
      // Log permission revoke event
      await logAuditEvent({
        action: 'permission_revoked',
        category: AuditLogCategory.SECURITY,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: revokedBy,
        target_resource: `user:${userId}`,
        details: {
          user_id: userId,
          permission: permission,
          revoked_by: revokedBy
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error in revokePermission:', error);
      return false;
    }
  },
  
  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // First check if user has admin role (admins have all permissions)
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (adminRole) {
        // Return all available permissions
        return Object.values(PERMISSIONS).flat();
      }
      
      // Get assigned permissions
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      // Get custom permissions
      const { data: customPermissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId);
        
      if (permissionsError) {
        console.error('Error fetching custom permissions:', permissionsError);
        return [];
      }
      
      // Combine role-based permissions and custom permissions
      const rolePermissions = roles.flatMap(({ role }) => {
        const roleEnum = role as UserRole;
        return PERMISSIONS[roleEnum] || [];
      });
      
      const userCustomPermissions = customPermissions.map(p => p.permission);
      
      // Remove duplicates
      return [...new Set([...rolePermissions, ...userCustomPermissions])];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }
};
