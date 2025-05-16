
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Extended User type that includes our custom properties
export interface User extends SupabaseUser {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  sfd_id?: string;
}

// Update the UserRole enum to use unique string values
export enum UserRole {
  Admin = 'admin',
  SuperAdmin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client',
  User = 'user'
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isClient: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string) => void;
  signIn: (email: string, password: string) => Promise<{ error?: any; data?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any; data?: any }>;
  signOut: () => Promise<{ error?: any }>;
  refreshSession: () => Promise<void>;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}

// Define the SFD Association types
export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  isDefault?: boolean;
  makeDefault?: boolean;
}

export interface AssociateSfdResult {
  success: boolean;
  error?: string;
  userSfd?: any;
}
