
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/utils/auth/roleTypes';
import { 
  canManageRole, 
  hasHigherPermission, 
  getRoleDescription,
  isSfdStaff,
  hasStaffPermission
} from '@/utils/auth/roleHierarchy';

export function useRolePermissions() {
  const { user, userRole } = useAuth();
  
  // Check if user can manage another user with specific role
  const canManage = (targetRole: UserRole) => {
    if (!userRole) return false;
    return canManageRole(userRole, targetRole);
  };
  
  // Check if user can manage SFD admin accounts
  const canManageSfdAdmins = () => {
    return userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;
  };
  
  // Check if user can manage clients
  const canManageClients = () => {
    return userRole === UserRole.SFD_ADMIN || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  };
  
  // Check if user can approve loans
  const canApproveLoan = (staffRole?: string) => {
    if (userRole === UserRole.SFD_ADMIN || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // If staff role is provided, check if they have loan approval permission
    if (staffRole) {
      return hasStaffPermission(staffRole, 'loan_approve');
    }
    
    return false;
  };
  
  // Check if user can view transactions
  const canViewTransactions = (staffRole?: string) => {
    if (userRole === UserRole.SFD_ADMIN || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // If staff role is provided, check if they have transaction view permission
    if (staffRole) {
      return hasStaffPermission(staffRole, 'transaction_view');
    }
    
    return false;
  };
  
  // Check if user can create transactions (deposits/withdrawals)
  const canCreateTransactions = (staffRole?: string) => {
    if (userRole === UserRole.SFD_ADMIN) {
      return true;
    }
    
    // If staff role is provided, check if they have transaction create permission
    if (staffRole) {
      return hasStaffPermission(staffRole, 'transaction_create');
    }
    
    return false;
  };
  
  // Check if a client can access specific functions
  const canClientAccess = (functionName: string) => {
    if (userRole !== UserRole.CLIENT) return false;
    
    const clientPermissions = {
      'view_balance': true,
      'request_loan': true,
      'view_loan_status': true,
      'view_transactions': true
    };
    
    return clientPermissions[functionName] || false;
  };
  
  return {
    canManage,
    canManageSfdAdmins,
    canManageClients,
    canApproveLoan,
    canViewTransactions,
    canCreateTransactions,
    canClientAccess,
    isAdmin: userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN,
    isSfdAdmin: userRole === UserRole.SFD_ADMIN,
    isClient: userRole === UserRole.CLIENT
  };
}
