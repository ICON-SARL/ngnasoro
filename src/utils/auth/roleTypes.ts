
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SFD_ADMIN = 'sfd_admin',
  SFD_AGENT = 'sfd_agent',
  CLIENT = 'client',
  USER = 'user'
}

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  roles: UserRole[];
}

export const PERMISSIONS = {
  // Global permissions
  MANAGE_ALL_SFDS: 'manage_all_sfds',
  VIEW_ALL_SFDS: 'view_all_sfds',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  
  // Subsidy related
  APPROVE_SUBSIDIES: 'approve_subsidies',
  REQUEST_SUBSIDIES: 'request_subsidies',
  VIEW_ALL_SUBSIDIES: 'view_all_subsidies',
  
  // SFD specific
  MANAGE_SFD: 'manage_sfd',
  VIEW_SFD: 'view_sfd',
  MANAGE_SFD_USERS: 'manage_sfd_users',
  
  // Loans and clients
  MANAGE_LOANS: 'manage_loans',
  APPROVE_LOANS: 'approve_loans',
  VIEW_LOANS: 'view_loans',
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_CLIENTS: 'view_clients',
  
  // Reports
  GENERATE_GLOBAL_REPORTS: 'generate_global_reports',
  GENERATE_SFD_REPORTS: 'generate_sfd_reports',
  
  // Audit logs
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_AUDIT_LOGS: 'manage_audit_logs'
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    PERMISSIONS.MANAGE_ALL_SFDS,
    PERMISSIONS.VIEW_ALL_SFDS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.APPROVE_SUBSIDIES,
    PERMISSIONS.VIEW_ALL_SUBSIDIES,
    PERMISSIONS.GENERATE_GLOBAL_REPORTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_AUDIT_LOGS
  ],
  [UserRole.SFD_ADMIN]: [
    PERMISSIONS.MANAGE_SFD,
    PERMISSIONS.VIEW_SFD,
    PERMISSIONS.MANAGE_SFD_USERS,
    PERMISSIONS.REQUEST_SUBSIDIES,
    PERMISSIONS.MANAGE_LOANS,
    PERMISSIONS.APPROVE_LOANS,
    PERMISSIONS.VIEW_LOANS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.GENERATE_SFD_REPORTS
  ],
  [UserRole.SFD_AGENT]: [
    PERMISSIONS.VIEW_SFD,
    PERMISSIONS.VIEW_LOANS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_CLIENTS
  ],
  [UserRole.CLIENT]: [],
  [UserRole.USER]: []
}
