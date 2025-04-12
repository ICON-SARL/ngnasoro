
export enum UserRole {
  SUPER_ADMIN = 'admin',
  ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

// Define available permissions in the system
export const PERMISSIONS = {
  // Super Admin (MEREF) permissions
  VALIDATE_SFD_FUNDS: 'validate_sfd_funds',
  AUDIT_SFD_ACCOUNTS: 'audit_sfd_accounts',
  GENERATE_REPORTS: 'generate_reports',
  MANAGE_USERS: 'manage_users',
  MANAGE_SFDS: 'manage_sfds',
  
  // SFD Admin permissions
  VALIDATE_CLIENT_ACCOUNTS: 'validate_client_accounts',
  CREATE_CLIENT_ACCOUNTS: 'create_client_accounts',
  MANAGE_SFD_LOANS: 'manage_sfd_loans',
  MANAGE_SFD_REPAYMENTS: 'manage_sfd_repayments',
  MANAGE_SFD_SAVINGS: 'manage_sfd_savings',
  VALIDATE_MOBILE_MONEY: 'validate_mobile_money',
  
  // Client permissions
  ACCESS_SAVINGS: 'access_savings',
  USE_MOBILE_MONEY: 'use_mobile_money',
  VIEW_LOAN_HISTORY: 'view_loan_history',
  
  // Shared/Common permissions
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_LOANS: 'manage_loans',
  MANAGE_SUBSIDIES: 'manage_subsidies',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  APPROVE_CREDIT: 'approve_credit',
  ACCESS_ADMIN_DASHBOARD: 'access_admin_dashboard',
  ACCESS_SFD_DASHBOARD: 'access_sfd_dashboard',
  ACCESS_CLIENT_DASHBOARD: 'access_client_dashboard',
};

// Define default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  // Super Admin (MEREF) has all permissions
  [UserRole.ADMIN]: [
    PERMISSIONS.VALIDATE_SFD_FUNDS,
    PERMISSIONS.AUDIT_SFD_ACCOUNTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SFDS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_LOANS,
    PERMISSIONS.MANAGE_SUBSIDIES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.APPROVE_CREDIT,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
  
  // SFD Admin permissions
  [UserRole.SFD_ADMIN]: [
    PERMISSIONS.VALIDATE_CLIENT_ACCOUNTS,
    PERMISSIONS.CREATE_CLIENT_ACCOUNTS,
    PERMISSIONS.MANAGE_SFD_LOANS,
    PERMISSIONS.MANAGE_SFD_REPAYMENTS,
    PERMISSIONS.MANAGE_SFD_SAVINGS,
    PERMISSIONS.VALIDATE_MOBILE_MONEY,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_LOANS,
    PERMISSIONS.ACCESS_SFD_DASHBOARD,
    PERMISSIONS.MANAGE_SUBSIDIES,
  ],
  
  // Client permissions
  [UserRole.CLIENT]: [
    PERMISSIONS.ACCESS_SAVINGS,
    PERMISSIONS.USE_MOBILE_MONEY,
    PERMISSIONS.VIEW_LOAN_HISTORY,
    PERMISSIONS.ACCESS_CLIENT_DASHBOARD,
  ],
  
  // Basic user permissions (minimal)
  [UserRole.USER]: [],
};
