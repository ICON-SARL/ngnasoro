
import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;

export enum UserRole {
  SuperAdmin = 'admin',
  SfdAdmin = 'sfd_admin',
  User = 'user'
}

export type Role = 'admin' | 'sfd_admin' | 'user';

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  session: any | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
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
