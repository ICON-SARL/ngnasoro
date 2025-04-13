
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  // Additional user properties
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
}

export enum UserRole {
  SuperAdmin = 'admin',
  Admin = 'admin',
  SfdAdmin = 'sfd_admin',
  CLIENT = 'client',
  User = 'user'
}

export enum Role {
  ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  signUp?: (email: string, password: string, metadata?: any) => Promise<{ error: any; data?: any }>;
  refreshSession: () => Promise<void>;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  
  // Additional properties needed
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: () => Promise<void>;
}

// Add AssociateSfdParams type for admin functions
export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  isDefault?: boolean;
  makeDefault?: boolean;
  role?: string;
}

export interface AssociateSfdResult {
  success: boolean;
  error?: string;
  userSfd?: any;
}
