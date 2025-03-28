
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

export interface User extends Omit<SupabaseUser, 'user_metadata' | 'app_metadata'> {
  email: string;
  full_name: string;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
  aud: string;
  created_at: string;
}

export type UserRole = 'admin' | 'sfd_admin' | 'user';

export type Permission = 
  | 'access_mobile_app'
  | 'access_admin_panel'
  | 'access_sfd_panel'
  | 'manage_users'
  | 'manage_sfds'
  | 'manage_sfd_clients'
  | 'manage_sfd_loans'
  | 'approve_subsidies'
  | 'view_reports'
  | 'view_audit_logs'
  | 'apply_for_loans'
  | 'make_transfers'
  | 'view_transactions'
  | 'view_sfd_subsidies'
  | 'view_sfd_reports';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string, useOtp?: boolean) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  loading: boolean;
  isLoading: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  isAdmin: boolean;
  userRole: UserRole | null;
  verifyBiometricAuth: () => Promise<boolean>;
  biometricEnabled: boolean;
  toggleBiometricAuth: (enabled: boolean) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}
