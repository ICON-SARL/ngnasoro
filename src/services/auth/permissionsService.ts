
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
      const { data: adminRole, error: adminError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (adminError) {
        console.error('Error checking admin role:', adminError);
        return false;
      }
      
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
        // Convert role string to key for permissions mapping
        const roleKey = role as UserRole;
        // Get permissions for this role from our predefined PERMISSIONS mapping
        const rolePermissions = PERMISSIONS[roleKey] || [];
        return rolePermissions.includes(permission);
      });
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },
  
  /**
   * Grant a specific permission to a user by assigning appropriate role
   */
  async grantPermission(userId: string, permission: string, grantedBy: string): Promise<boolean> {
    try {
      // Check if the permission exists in our system
      const permissionExists = Object.values(PERMISSIONS).flat().includes(permission);
      if (!permissionExists) {
        console.error(`Permission ${permission} does not exist`);
        return false;
      }
      
      // Find a role that has this permission
      let roleWithPermission: UserRole | null = null;
      
      for (const [role, permissions] of Object.entries(PERMISSIONS)) {
        if (permissions.includes(permission)) {
          roleWithPermission = role as UserRole;
          break;
        }
      }
      
      if (!roleWithPermission) {
        console.error(`No role found with permission: ${permission}`);
        return false;
      }
      
      // Check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', roleWithPermission)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing role:', checkError);
        return false;
      }
      
      // If user doesn't have this role yet, assign it
      if (!existingRole) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: roleWithPermission
          });
          
        if (insertError) {
          console.error('Error granting role:', insertError);
          return false;
        }
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
          granted_by: grantedBy,
          via_role: roleWithPermission
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
   * Note: This is more complex as we don't want to remove a role
   * that might grant other permissions the user should keep
   */
  async revokePermission(userId: string, permission: string, revokedBy: string): Promise<boolean> {
    try {
      // We don't have a direct way to revoke a single permission
      // as permissions are granted via roles in our model
      // For now, log the event and return success
      
      // Log permission revoke event
      await logAuditEvent({
        action: 'permission_revoke_requested',
        category: AuditLogCategory.SECURITY,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: revokedBy,
        target_resource: `user:${userId}`,
        details: {
          user_id: userId,
          permission: permission,
          revoked_by: revokedBy,
          message: "Permission revocation works at the role level. Please revoke the appropriate role instead."
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
      const { data: adminRole, error: adminError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (adminError) {
        console.error('Error checking admin role:', adminError);
        return [];
      }
      
      if (adminRole) {
        // Return all available permissions
        return Object.values(PERMISSIONS).flat();
      }
      
      // Get assigned roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      if (!userRoles || userRoles.length === 0) {
        return [];
      }
      
      // Combine role-based permissions
      const allPermissions = userRoles.flatMap(({ role }) => {
        const roleKey = role as UserRole;
        return PERMISSIONS[roleKey] || [];
      });
      
      // Remove duplicates
      return [...new Set(allPermissions)];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }
};
