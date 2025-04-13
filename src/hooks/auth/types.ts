
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  // Additional user properties can be added here
}

export enum UserRole {
  SuperAdmin = 'admin',
  Admin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client',
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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  isAdmin: boolean;
  isSfdAdmin: boolean;
}
