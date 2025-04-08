
import { useAuth } from '../useAuth';
import { UserRole } from './types';
import { ROLE_PERMISSIONS } from './types';

export const usePermissions = () => {
  const { user } = useAuth();
  
  // Get the user's role
  const userRole = user?.role || UserRole.USER;
  
  // Get the permissions for that role
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  
  // Check if user has a specific permission
  const hasPermission = (permission: string) => {
    if (!user) return false;
    
    return permissions.includes(permission);
  };
  
  // Check if user is a super admin
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  
  // Check if user is a SFD admin
  const isSfdAdmin = userRole === UserRole.SFD_ADMIN;
  
  // Check if user is a regular user
  const isRegularUser = userRole === UserRole.USER;
  
  return {
    permissions,
    hasPermission,
    userRole,
    isSuperAdmin,
    isSfdAdmin,
    isRegularUser
  };
};
