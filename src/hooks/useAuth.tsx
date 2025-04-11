import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type User, UserRole, type AuthContextProps } from './auth/types';

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  activeSfdId: null,
  userRole: UserRole.User,
  isAdmin: false,
  isSfdAdmin: false,
  setActiveSfdId: () => {},
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  refreshSession: async () => {},
  biometricEnabled: false,
  toggleBiometricAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

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
          setUserRole(role as UserRole);
          
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
    setUserRole(role as UserRole);
    
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
    return Promise.resolve();
  };

  const signIn = async (email: string, password: string) => {
    // Mock implementation for signIn
    try {
      // This would be a real authentication call in production
      // For demo purposes, let's simulate a successful login
      const mockUser = {
        id: 'user-123',
        email,
        user_metadata: {
          full_name: 'Test User'
        },
        app_metadata: {
          role: 'client'
        }
      };
      
      login(mockUser as User, 'mock-jwt-token');
      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    // Mock implementation for signUp
    try {
      // This would be a real registration call in production
      const mockUser = {
        id: 'user-' + Date.now(),
        email,
        user_metadata: metadata || {},
        app_metadata: {
          role: 'client'
        }
      };
      
      login(mockUser as User, 'mock-jwt-token');
      return { error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { error };
    }
  };

  const refreshSession = async () => {
    // Mock implementation for refreshSession
    return Promise.resolve();
  };

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
    return Promise.resolve();
  };

  // Calculate isAdmin and isSfdAdmin based on userRole
  const isAdmin = userRole === UserRole.SuperAdmin;
  const isSfdAdmin = userRole === UserRole.SfdAdmin;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading, 
        activeSfdId, 
        userRole,
        isAdmin,
        isSfdAdmin,
        setActiveSfdId,
        signOut,
        signIn,
        signUp,
        refreshSession,
        login,
        biometricEnabled,
        toggleBiometricAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
