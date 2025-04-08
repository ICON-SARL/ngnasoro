
export enum UserRole {
  USER = 'user',
  SFD_ADMIN = 'sfd_admin',
  SUPER_ADMIN = 'super_admin'
}

export const PERMISSIONS = {
  // General permissions
  ACCESS_SFD_DASHBOARD: 'access_sfd_dashboard',
  
  // Client management
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_CLIENT_DETAILS: 'view_client_details',
  
  // Loan management
  MANAGE_LOANS: 'manage_loans',
  APPROVE_CREDIT: 'approve_credit',
  
  // Admin management
  MANAGE_ADMINS: 'manage_admins',
  
  // Data management
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings'
};

export const ROLE_PERMISSIONS = {
  [UserRole.USER]: [
    // Basic user permissions
  ],
  [UserRole.SFD_ADMIN]: [
    PERMISSIONS.ACCESS_SFD_DASHBOARD,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_CLIENT_DETAILS,
    PERMISSIONS.MANAGE_LOANS,
    PERMISSIONS.EXPORT_DATA
  ],
  [UserRole.SUPER_ADMIN]: [
    // Super admins have all permissions
    ...Object.values(PERMISSIONS)
  ]
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};
