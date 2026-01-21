
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Extension du type User de Supabase pour inclure les propriétés additionnelles
export interface User extends SupabaseUser {
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
}

export enum UserRole {
  Admin = 'admin',
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
  isCheckingRole: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string) => void;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signOut: () => Promise<any>;
  refreshSession: () => Promise<void>;
  forceRefreshRole: () => Promise<UserRole | null>;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}

// Types pour l'association SFD
export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  role?: string;
  isDefault?: boolean;
  makeDefault?: boolean;
}

export interface AssociateSfdResult {
  success: boolean;
  error?: string;
  data?: any;
  userSfd?: any;
}
