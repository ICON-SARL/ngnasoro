
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export enum UserRole {
  SuperAdmin = 'admin',
  Admin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client',
  User = 'user'
}

// This extends SupabaseUser while making fields compatible
export interface User extends Omit<SupabaseUser, 'app_metadata' | 'user_metadata'> {
  app_metadata?: {
    role?: string;
    sfd_id?: string;
    [key: string]: any;
  };
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    [key: string]: any;
  };
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string;
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

// Add the missing AssociateSfdParams and related types
export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  makeDefault?: boolean;
  isDefault?: boolean;
}

export interface AssociateSfdResult {
  success: boolean;
  error?: string;
  userSfd?: any;
}
