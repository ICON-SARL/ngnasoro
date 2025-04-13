
export enum Role {
  SUPER_ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

export type Permission = string;

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
  MANAGE_SFD_LOANS: 'manage_sfd_loans',
  MANAGE_SFD_SAVINGS: 'manage_sfd_savings',
  
  // Client permissions
  ACCESS_SAVINGS: 'access_savings',
  VIEW_LOAN_HISTORY: 'view_loan_history',
  
  // Shared/Common permissions
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_LOANS: 'manage_loans',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
};
