
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

// Comprehensive list of all possible permissions in the system
export type Permission = 
  // Admin permissions
  | 'access_admin_panel'        // Access to the super admin dashboard
  | 'manage_users'              // Create, edit, delete users system-wide
  | 'manage_sfds'               // Create, edit, delete SFDs
  | 'manage_roles'              // Manage role assignments
  | 'approve_subsidies'         // Approve or reject subsidy requests
  | 'view_audit_logs'           // View system audit logs
  | 'manage_system_settings'    // Configure system-wide settings
  
  // SFD Admin permissions
  | 'access_sfd_panel'          // Access to the SFD admin dashboard
  | 'manage_sfd_clients'        // Create, edit, delete clients within assigned SFD
  | 'manage_sfd_loans'          // Create, edit, manage loans within assigned SFD
  | 'view_sfd_subsidies'        // View subsidies related to assigned SFD
  | 'view_sfd_reports'          // Access reports for assigned SFD
  
  // User permissions
  | 'access_mobile_app'         // Access to the mobile application
  | 'apply_for_loans'           // Submit loan applications
  | 'make_transfers'            // Make financial transfers
  | 'view_transactions'         // View transaction history
  | 'manage_personal_profile';  // Update personal information

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
