
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export enum UserRole {
  SuperAdmin = 'admin',
  Admin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client',
  User = 'user'
}

export interface User extends SupabaseUser {
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
  full_name?: string; // Adding direct property for compatibility
}

export type Role = 'admin' | 'sfd_admin' | 'client' | 'user';

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isClient: boolean;
  userRole: UserRole | string;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}
