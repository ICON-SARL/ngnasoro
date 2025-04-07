
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
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
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [UserRole.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SFDS,
    PERMISSIONS.MANAGE_SUBSIDIES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.APPROVE_CREDIT,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
  [UserRole.SFD_ADMIN]: [
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_LOANS,
    PERMISSIONS.ACCESS_SFD_DASHBOARD,
    PERMISSIONS.MANAGE_SUBSIDIES, // Ajout de la permission MANAGE_SUBSIDIES aux SFD_ADMIN
  ],
  [UserRole.USER]: [],
};
