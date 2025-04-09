
import { UserRole } from "./roleTypes";

// Define the role hierarchy
export const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: {
    level: 100,
    canManage: [UserRole.SFD_ADMIN, UserRole.ADMIN, UserRole.USER],
    description: 'Administrateur MEREF'
  },
  [UserRole.ADMIN]: { 
    level: 90,
    canManage: [UserRole.SFD_ADMIN, UserRole.USER],
    description: 'Administrateur MEREF'
  },
  [UserRole.SFD_ADMIN]: {
    level: 50,
    canManage: [UserRole.CLIENT, UserRole.USER],
    description: 'Administrateur SFD'
  },
  [UserRole.CLIENT]: {
    level: 10,
    canManage: [],
    description: 'Client SFD'
  },
  [UserRole.USER]: {
    level: 1,
    canManage: [],
    description: 'Utilisateur'
  }
};

// SFD Admin staff roles
export const SFD_STAFF_ROLES = {
  CASHIER: 'cashier',
  CREDIT_AGENT: 'credit_agent',
  FIELD_AGENT: 'field_agent',
  SUPERVISOR: 'supervisor',
};

// Check if a user can manage another role
export const canManageRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (!userRole || !targetRole) return false;
  
  const hierarchy = ROLE_HIERARCHY[userRole];
  if (!hierarchy) return false;
  
  return hierarchy.canManage.includes(targetRole);
};

// Check if a user has higher permissions than another
export const hasHigherPermission = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (!userRole || !targetRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole]?.level || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole]?.level || 0;
  
  return userLevel > targetLevel;
};

// Function to get role description
export const getRoleDescription = (role: UserRole): string => {
  return ROLE_HIERARCHY[role]?.description || 'Rôle inconnu';
};

// Function to check if a user is an SFD staff member
export const isSfdStaff = (staffRole: string): boolean => {
  return Object.values(SFD_STAFF_ROLES).includes(staffRole);
};

// Get the list of staff roles an SFD admin can assign
export const getSfdStaffRoles = (): string[] => {
  return Object.values(SFD_STAFF_ROLES);
};

// Function to check specific staff permissions
export const hasStaffPermission = (staffRole: string, permission: string): boolean => {
  // Define permissions for each staff role
  const rolePermissions: Record<string, string[]> = {
    [SFD_STAFF_ROLES.CASHIER]: [
      'transaction_view', 
      'transaction_create', 
      'client_view'
    ],
    [SFD_STAFF_ROLES.CREDIT_AGENT]: [
      'client_view', 
      'loan_view', 
      'loan_create', 
      'loan_approve'
    ],
    [SFD_STAFF_ROLES.FIELD_AGENT]: [
      'client_view', 
      'client_create', 
      'loan_view', 
      'loan_create'
    ],
    [SFD_STAFF_ROLES.SUPERVISOR]: [
      'transaction_view',
      'client_view', 
      'loan_view', 
      'loan_create', 
      'loan_approve', 
      'report_view'
    ],
  };
  
  return rolePermissions[staffRole]?.includes(permission) || false;
};
