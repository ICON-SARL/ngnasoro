
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export enum UserRole {
  SuperAdmin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client',
  User = 'user' // Adding User role that was referenced but missing
}

export interface User extends SupabaseUser {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  sfd_id?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | string;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isClient: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}

// Adding the missing interfaces
export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  isDefault?: boolean;
  makeDefault?: boolean;
}

export interface AssociateSfdResult {
  success: boolean;
  userSfd?: any;
  error?: string;
}
