
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

// Use string for compatibility with existing code
export const SUPER_ADMIN = 'admin';
export const SFD_ADMIN = 'sfd_admin';
export const CLIENT = 'client';

// Permission constants
export const PERMISSIONS = {
  CREATE_SFD: 'create_sfd',
  EDIT_SFD: 'edit_sfd',
  DELETE_SFD: 'delete_sfd',
  VIEW_SFD: 'view_sfd',
  CREATE_SFD_ADMIN: 'create_sfd_admin',
  EDIT_SFD_ADMIN: 'edit_sfd_admin',
  DELETE_SFD_ADMIN: 'delete_sfd_admin',
  VIEW_SFD_ADMIN: 'view_sfd_admin',
  APPROVE_SUBSIDY: 'approve_subsidy',
  REJECT_SUBSIDY: 'reject_subsidy',
  AUDIT_REPORTS: 'audit_reports',
  // Add missing permissions referenced in RoleChecker
  VALIDATE_SFD_FUNDS: 'validate_sfd_funds',
  MANAGE_SFDS: 'manage_sfds',
  PKI_MANAGEMENT: 'pki_management',
  CREATE_CLIENT_ACCOUNTS: 'create_client_accounts',
  VALIDATE_CLIENT_ACCOUNTS: 'validate_client_accounts',
  MANAGE_SFD_LOANS: 'manage_sfd_loans',
  APPROVE_CLIENT_ADHESION: 'approve_client_adhesion',
  REJECT_CLIENT_ADHESION: 'reject_client_adhesion',
  DEPOSIT_SAVINGS: 'deposit_savings',
  WITHDRAW_SAVINGS: 'withdraw_savings',
  REQUEST_LOAN: 'request_loan',
  REPAY_LOAN: 'repay_loan',
  REQUEST_ADHESION: 'request_adhesion'
};

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    PERMISSIONS.CREATE_SFD,
    PERMISSIONS.EDIT_SFD,
    PERMISSIONS.DELETE_SFD,
    PERMISSIONS.VIEW_SFD,
    PERMISSIONS.CREATE_SFD_ADMIN,
    PERMISSIONS.EDIT_SFD_ADMIN,
    PERMISSIONS.DELETE_SFD_ADMIN,
    PERMISSIONS.VIEW_SFD_ADMIN,
    PERMISSIONS.APPROVE_SUBSIDY,
    PERMISSIONS.REJECT_SUBSIDY,
    PERMISSIONS.AUDIT_REPORTS,
    PERMISSIONS.VALIDATE_SFD_FUNDS,
    PERMISSIONS.MANAGE_SFDS,
    PERMISSIONS.PKI_MANAGEMENT
  ],
  [UserRole.ADMIN]: [
    PERMISSIONS.CREATE_SFD,
    PERMISSIONS.EDIT_SFD,
    PERMISSIONS.VIEW_SFD,
    PERMISSIONS.APPROVE_SUBSIDY,
    PERMISSIONS.REJECT_SUBSIDY,
    PERMISSIONS.AUDIT_REPORTS,
    PERMISSIONS.VALIDATE_SFD_FUNDS,
    PERMISSIONS.MANAGE_SFDS
  ],
  [UserRole.SFD_ADMIN]: [
    PERMISSIONS.CREATE_CLIENT_ACCOUNTS,
    PERMISSIONS.VALIDATE_CLIENT_ACCOUNTS,
    PERMISSIONS.MANAGE_SFD_LOANS,
    PERMISSIONS.APPROVE_CLIENT_ADHESION,
    PERMISSIONS.REJECT_CLIENT_ADHESION
  ],
  [UserRole.CLIENT]: [
    PERMISSIONS.DEPOSIT_SAVINGS,
    PERMISSIONS.WITHDRAW_SAVINGS,
    PERMISSIONS.REQUEST_LOAN,
    PERMISSIONS.REPAY_LOAN
  ],
  [UserRole.USER]: [
    PERMISSIONS.REQUEST_ADHESION
  ]
};
