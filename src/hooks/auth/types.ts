
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Permission, Role } from '@/utils/audit/auditPermissions';

export interface User extends SupabaseUser {
  full_name?: string;
  role?: Role;
  permissions?: Permission[];
  avatar_url?: string;
}

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: Error }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: Error }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: Error }>;
  updateProfile: (profile: Partial<User>) => Promise<{ success: boolean; error?: Error }>;
  hasPermission: (permission: Permission) => Promise<boolean>;
  hasRole: (role: Role) => Promise<boolean>;
}
