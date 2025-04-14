
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export enum UserRole {
  SuperAdmin = 'admin',
  Admin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client',
  User = 'user'
}

export type Role = UserRole | string;

export interface User extends SupabaseUser {
  app_metadata?: {
    role?: UserRole | string;
    [key: string]: any;
  };
  user_metadata?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    profile_completed?: boolean;
    [key: string]: any;
  };
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp?: (email: string, password: string, metadata?: any) => Promise<{ error: any; data?: any }>;
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
