
export enum UserRole {
  SUPER_ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  USER = 'user'
}

export type Role = 'admin' | 'sfd_admin' | 'user' | null;

export interface User {
  id: string;
  email: string;
  full_name?: string;
  app_metadata?: {
    role: Role;
    role_assigned?: boolean;
    roles?: string[];
    sfd_id?: string;
  };
}

export interface SignOutResult {
  success: boolean;
  error?: string;
}

export interface AuthContextProps {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  signOut: () => Promise<SignOutResult>;
  signUp: (data: any) => Promise<void>;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  userRole: Role;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}
