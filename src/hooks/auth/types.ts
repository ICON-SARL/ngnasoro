
export enum UserRole {
  CLIENT = 'client',
  SFD_ADMIN = 'sfd_admin',
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  UNKNOWN = 'unknown'
}

export type Role = 'admin' | 'sfd_admin' | 'user' | 'client' | null;

export interface UserMetadata {
  full_name?: string;
  phone?: string;
  role?: UserRole;
  sfd_id?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string | null;
  user_metadata: {
    [key: string]: any;
    sfd_id?: string;
    full_name?: string;
    phone?: string;
  };
  app_metadata: {
    role?: Role;
    role_assigned?: boolean;
    roles?: string[];
    sfd_id?: string;
  };
}

export interface UserSession {
  id: string;
  email: string;
  user_metadata: UserMetadata;
  app_metadata: {
    role?: string;
  };
}

export interface AuthContextProps {
  user: User | null;
  setUser?: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  isSfdAdmin?: boolean;
  activeSfdId?: string | null;
  setActiveSfdId?: (sfdId: string | null) => void;
  userRole?: Role;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: () => Promise<void>;
  session?: any | null;
  isLoading?: boolean;
  refreshSession?: () => Promise<void>;
  signInWithOAuth?: (provider: string) => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  updatePassword?: (password: string) => Promise<void>;
  updateUserData?: (data: Partial<UserMetadata>) => Promise<void>;
  checkAuth?: () => Promise<UserSession | null>;
  sendMagicLink?: (email: string) => Promise<void>;
  switchActiveSfd?: (sfdId: string) => Promise<void>;
  error?: Error | null;
}

export type AuthContextType = AuthContextProps;

export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  makeDefault?: boolean;
}

export interface AssociateSfdResult {
  success: boolean;
  error?: string;
  userSfd?: any;
}
