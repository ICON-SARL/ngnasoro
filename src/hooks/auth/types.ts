
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export enum UserRole {
  User = 'client',
  SfdAdmin = 'sfd_admin',
  SuperAdmin = 'admin',
  CLIENT = 'client'  // Adding CLIENT for backward compatibility
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface User extends SupabaseUser {
  // Additional properties specific to your application
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string;
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data?: any }>;
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

// Adding the missing type definitions for SFD association
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
