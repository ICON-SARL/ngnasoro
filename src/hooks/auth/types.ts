// Define user roles
export enum UserRole {
  USER = 'USER',
  SFD_ADMIN = 'SFD_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  avatar_url?: string;
  sfd_id?: string;
  full_name?: string;
  // Add any other relevant fields
}

export interface Role {
  name: string;
  permissions: string[];
}

// AuthContext interface
export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  activeSfdId?: string;
  setActiveSfdId: (sfdId: string) => void;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: () => void;
  // Add any other auth-related functions
}
