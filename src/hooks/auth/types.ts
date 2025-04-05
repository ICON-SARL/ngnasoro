
// Create this file if it doesn't exist
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
  app_metadata?: {
    roles?: string[];
  };
}

export type Role = 'user' | 'admin' | 'sfd_admin' | 'super_admin';

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
}
