
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
}

export enum UserRole {
  SuperAdmin = 'admin',
  SfdAdmin = 'sfd_admin',
  User = 'user'
}

export type Role = 'admin' | 'sfd_admin' | 'user';

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any | null }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  userRole: UserRole;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}

export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  makeDefault?: boolean;
}

export interface AssociateSfdResult {
  success: boolean;
  userSfd?: any;
  error?: string;
}
