
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SFD_ADMIN = 'sfd_admin',
  USER = 'user'
}

export interface User extends SupabaseUser {
  role?: UserRole;
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
  email?: string;
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isAuthenticated: boolean;
  activeSfdId?: string;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp?: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: (enable: boolean) => Promise<void>;
}

export const ROLE_PERMISSIONS = {
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

export const DEFAULT_ROLE_PERMISSIONS = ROLE_PERMISSIONS;
