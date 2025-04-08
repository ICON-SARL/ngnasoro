
// Define user roles
export enum UserRole {
  USER = 'USER',
  SFD_ADMIN = 'SFD_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface Role {
  name: string;
  permissions: string[];
}

// Define role permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'view_dashboard',
    'manage_sfds',
    'approve_subsidies',
    'manage_admins',
    'view_reports',
    'view_audit_logs',
    'export_data'
  ],
  [UserRole.SFD_ADMIN]: [
    'view_sfd_dashboard', 
    'manage_clients',
    'manage_loans',
    'request_subsidies',
    'view_sfd_reports'
  ],
  [UserRole.USER]: [
    'view_account',
    'view_loans',
    'make_payments'
  ]
};

// AuthContext interface
export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  activeSfdId?: string;
  setActiveSfdId: (sfdId: string) => void;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: () => void;
  refreshSession?: () => Promise<void>;
}
