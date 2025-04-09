
export enum UserRole {
  SUPER_ADMIN = 'admin',
  ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client', // Added CLIENT role
  USER = 'user'
}

// Define available permissions in the system
export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_SFDS: 'manage_sfds',
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_LOANS: 'manage_loans',
  MANAGE_SUBSIDIES: 'manage_subsidies',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  APPROVE_CREDIT: 'approve_credit',
  ACCESS_ADMIN_DASHBOARD: 'access_admin_dashboard',
  ACCESS_SFD_DASHBOARD: 'access_sfd_dashboard',
};

// Define default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  // Since SUPER_ADMIN and ADMIN have the same enum value ('admin'),
  // we only need to define it once
  [UserRole.ADMIN]: Object.values(PERMISSIONS),
  [UserRole.SFD_ADMIN]: [
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_LOANS,
    PERMISSIONS.ACCESS_SFD_DASHBOARD,
    PERMISSIONS.MANAGE_SUBSIDIES,
  ],
  [UserRole.CLIENT]: [],
  [UserRole.USER]: [],
};
