
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Permission, Role } from '@/utils/audit/auditPermissions';

export interface User extends SupabaseUser {
  full_name?: string;
  role?: Role;
  permissions?: Permission[];
  avatar_url?: string;
  sfd_id?: string; // Add this field
}

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isLoading: boolean; // Renamed from loading for consistency
  loading: boolean; // Legacy field for backward compatibility
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: Error }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: Error }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: Error }>;
  updateProfile: (profile: Partial<User>) => Promise<{ success: boolean; error?: Error }>;
  hasPermission: (permission: Permission) => Promise<boolean>;
  hasRole: (role: Role) => Promise<boolean>;
  
  // SFD-related properties
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
  isAdmin: boolean; // Convenience property
  
  // Mobile-related properties
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}
