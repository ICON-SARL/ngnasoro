
export interface User {
  id: string;
  email: string;
  app_metadata: {
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  // Adding properties that are used in the application
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string;
  aud: string; // Changed from optional to required
  created_at?: string;
  // Add any other properties that might be needed
}

export enum Role {
  SUPER_ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

export interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<{ error?: any } | undefined>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  userRole: Role | null;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  // Add these properties to fix the errors in other components
  session?: any;
  hasPermission?: (permission: string) => boolean;
  hasRole?: (role: string) => boolean;
  isLoading?: boolean;
}
