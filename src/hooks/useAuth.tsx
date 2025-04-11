
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  sfd_id?: string;
  app_metadata?: {
    role?: string;
    sfd_id?: string;
  };
  user_metadata?: {
    full_name?: string;
    role?: string;
    sfd_id?: string;
  };
}

export interface AuthContextProps {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  activeSfdId: string | null;
  userRole: string | null;
  setActiveSfdId: (sfdId: string) => void;
  signOut: () => Promise<void>;
  login: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  error: null,
  activeSfdId: null,
  userRole: null,
  setActiveSfdId: () => {},
  signOut: async () => {},
  login: () => {},
});

export const UserRole = {
  Client: 'client',
  SfdAdmin: 'sfd_admin',
  SfdStaff: 'sfd_staff',
  SuperAdmin: 'admin',
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Simulate checking for an existing session
    const checkSession = async () => {
      try {
        // Get stored auth data from localStorage
        const storedUser = localStorage.getItem('ngna_user');
        const storedToken = localStorage.getItem('ngna_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setSession({ access_token: storedToken });
          
          // Set userRole based on app_metadata or user_metadata
          const role = userData.app_metadata?.role || userData.user_metadata?.role || 'client';
          setUserRole(role);
          
          // Set activeSfdId if available
          if (userData.app_metadata?.sfd_id) {
            setActiveSfdId(userData.app_metadata.sfd_id);
          } else if (userData.user_metadata?.sfd_id) {
            setActiveSfdId(userData.user_metadata.sfd_id);
          } else if (userData.sfd_id) {
            setActiveSfdId(userData.sfd_id);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('Failed to restore session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData: User, token: string) => {
    // Store user data and token in localStorage
    localStorage.setItem('ngna_user', JSON.stringify(userData));
    localStorage.setItem('ngna_token', token);
    
    setUser(userData);
    setSession({ access_token: token });
    
    // Set userRole based on app_metadata or user_metadata
    const role = userData.app_metadata?.role || userData.user_metadata?.role || 'client';
    setUserRole(role);
    
    // Set activeSfdId if available
    if (userData.app_metadata?.sfd_id) {
      setActiveSfdId(userData.app_metadata.sfd_id);
    } else if (userData.user_metadata?.sfd_id) {
      setActiveSfdId(userData.user_metadata.sfd_id);
    } else if (userData.sfd_id) {
      setActiveSfdId(userData.sfd_id);
    }
  };

  const signOut = async () => {
    // Clear stored auth data
    localStorage.removeItem('ngna_user');
    localStorage.removeItem('ngna_token');
    
    setUser(null);
    setSession(null);
    setUserRole(null);
    setActiveSfdId(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading, 
        error, 
        activeSfdId, 
        userRole,
        setActiveSfdId,
        signOut,
        login
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
