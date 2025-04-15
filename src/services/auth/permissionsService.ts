
import { supabase } from '@/integrations/supabase/client';
import { UserRole, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/utils/auth/roleTypes';

/**
 * Service for handling permissions and role verifications
 */
export const permissionsService = {
  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // First try to get from database function
      const { data: dbPermissions, error } = await supabase.rpc('get_role_permissions', {
        role_name: await this.getUserRole(userId)
      });
      
      if (error) {
        console.error('Error fetching permissions from database:', error);
        
        // Fallback to local permission definitions
        const userRole = await this.getUserRole(userId);
        return this.getPermissionsForRole(userRole as UserRole);
      }
      
      return dbPermissions || [];
    } catch (err) {
      console.error('Error in getUserPermissions:', err);
      return [];
    }
  },
  
  /**
   * Get the user's role
   */
  async getUserRole(userId: string): Promise<string> {
    try {
      // Try to get from user_roles table first
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (!roleError && roleData) {
        return roleData.role;
      }
      
      // Fallback to auth.users metadata
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        userId
      );
      
      if (userError || !userData) {
        return 'user'; // Default role
      }
      
      return userData.user.app_metadata?.role || 'user';
    } catch (err) {
      console.error('Error in getUserRole:', err);
      return 'user'; // Default role as fallback
    }
  },
  
  /**
   * Check if a user has a specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // First try to use the database function for real-time permission checking
      const { data, error } = await supabase.rpc('check_real_time_permission', {
        user_id: userId,
        permission_name: permission
      });
      
      if (!error && data) {
        return data.has_permission;
      }
      
      console.warn('Falling back to local permission check', error);
      
      // Fallback to local permission check
      const userPermissions = await this.getUserPermissions(userId);
      return userPermissions.includes(permission);
    } catch (err) {
      console.error('Error in hasPermission:', err);
      return false;
    }
  },
  
  /**
   * Get all permissions for a role from local definitions
   */
  getPermissionsForRole(role: UserRole): string[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
  },
  
  /**
   * Verify if a role exists
   */
  isValidRole(role: string): boolean {
    return Object.values(UserRole).includes(role as UserRole);
  }
};
