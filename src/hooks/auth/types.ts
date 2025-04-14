
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export enum UserRole {
  SuperAdmin = 'admin',
  Admin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client',
  User = 'user'
}

export type Role = UserRole | string;

// Need to correctly extend the base SupabaseUser type without conflicts
export interface User extends Omit<SupabaseUser, 'app_metadata' | 'user_metadata'> {
  app_metadata?: {
    role?: UserRole | string;
    sfd_id?: string;
    [key: string]: any;
  };
  user_metadata?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    profile_completed?: boolean;
    avatar_url?: string;
    [key: string]: any;
  };
  // Direct access properties for convenience
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
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

// Add missing interface for SFD association
export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  makeDefault?: boolean;
  isDefault?: boolean;
}

export interface AssociateSfdResult {
  success: boolean;
  userSfd?: any;
  error?: string;
}
