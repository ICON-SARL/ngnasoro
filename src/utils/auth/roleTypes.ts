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
  CREATE_SFD: 'create_sfd',
  CREATE_SFD_ADMIN: 'create_sfd_admin',
  AUDIT_REPORTS: 'audit_reports',
  PKI_MANAGEMENT: 'pki_management',
  
  // SFD Admin permissions
  VALIDATE_CLIENT_ACCOUNTS: 'validate_client_accounts',
  CREATE_CLIENT_ACCOUNTS: 'create_client_accounts',
  MANAGE_SFD_LOANS: 'manage_sfd_loans',
  MANAGE_SFD_REPAYMENTS: 'manage_sfd_repayments',
  MANAGE_SFD_SAVINGS: 'manage_sfd_savings',
  VALIDATE_MOBILE_MONEY: 'validate_mobile_money',
  APPROVE_CLIENT_ADHESION: 'approve_client_adhesion',
  REJECT_CLIENT_ADHESION: 'reject_client_adhesion',
  VIEW_CLIENT_ADHESIONS: 'view_client_adhesions',
  
  // Client permissions
  ACCESS_SAVINGS: 'access_savings',
  DEPOSIT_SAVINGS: 'deposit_savings',
  WITHDRAW_SAVINGS: 'withdraw_savings',
  USE_MOBILE_MONEY: 'use_mobile_money',
  VIEW_LOAN_HISTORY: 'view_loan_history',
  REQUEST_ADHESION: 'request_adhesion',
  REQUEST_LOAN: 'request_loan',
  REPAY_LOAN: 'repay_loan',
  
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
export const DEFAULT_ROLE_PERMISSIONS = {
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
    PERMISSIONS.VIEW_CLIENT_ADHESIONS,
    PERMISSIONS.CREATE_SFD,
    PERMISSIONS.CREATE_SFD_ADMIN,
    PERMISSIONS.AUDIT_REPORTS,
    PERMISSIONS.PKI_MANAGEMENT,
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
    PERMISSIONS.APPROVE_CLIENT_ADHESION,
    PERMISSIONS.REJECT_CLIENT_ADHESION,
    PERMISSIONS.VIEW_CLIENT_ADHESIONS,
  ],
  
  // Client permissions
  [UserRole.CLIENT]: [
    PERMISSIONS.ACCESS_SAVINGS,
    PERMISSIONS.DEPOSIT_SAVINGS,
    PERMISSIONS.WITHDRAW_SAVINGS,
    PERMISSIONS.USE_MOBILE_MONEY,
    PERMISSIONS.VIEW_LOAN_HISTORY,
    PERMISSIONS.ACCESS_CLIENT_DASHBOARD,
    PERMISSIONS.REQUEST_ADHESION,
    PERMISSIONS.REQUEST_LOAN,
    PERMISSIONS.REPAY_LOAN,
  ],
  
  // Basic user permissions (minimal)
  [UserRole.USER]: [
    PERMISSIONS.REQUEST_ADHESION,
    PERMISSIONS.ACCESS_CLIENT_DASHBOARD,
    PERMISSIONS.VIEW_LOAN_HISTORY,
    PERMISSIONS.REQUEST_LOAN,
  ],
};

// Fix error by adding explicit type and adding SUPER_ADMIN permissions reference
// Redoing this to maintain backwards compatibility with code that uses SUPER_ADMIN
DEFAULT_ROLE_PERMISSIONS[UserRole.SUPER_ADMIN] = DEFAULT_ROLE_PERMISSIONS[UserRole.ADMIN];
