
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  // Add any additional user properties needed
}

export enum Role {
  SUPER_ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

export interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  userRole: Role | null;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}
