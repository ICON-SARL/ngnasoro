
// Create this file if it doesn't exist
export interface User {
  id: string;
  email?: string;
  full_name?: string; 
  avatar_url?: string;
  phone?: string;
  sfd_id?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
  };
  app_metadata?: {
    role?: string; // Single role string
    role_assigned?: boolean;
    roles?: string[]; // Array of roles
  };
}

export type Role = 'user' | 'admin' | 'sfd_admin' | 'super_admin';

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
  userRole: Role | null;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  session: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Define an enum to be used as a value (not just a type)
export enum UserRole {
  SUPER_ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}
