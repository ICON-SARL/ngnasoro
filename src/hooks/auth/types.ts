
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
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

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string, useOtp?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
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
