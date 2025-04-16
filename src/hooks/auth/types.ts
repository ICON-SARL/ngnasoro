
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Extended User type to include common properties
export interface User extends SupabaseUser {
  // Add properties that we access but might not be in the Supabase User type
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
}

export enum UserRole {
  SuperAdmin = 'super_admin',
  Admin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client',
  User = 'user'
}

export type Role = UserRole | string;

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isClient: boolean;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: () => Promise<void>;
  signUp?: (email: string, password: string, userData?: any) => Promise<any>;
}

// Parameters for associating a user with an SFD
export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  isDefault?: boolean;
  makeDefault?: boolean;
}

// Result of associating a user with an SFD
export interface AssociateSfdResult {
  success: boolean;
  error?: string;
  userSfd?: any;
}
