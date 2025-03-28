
import React, { createContext, ReactNode } from 'react';
import { useAuthProvider } from './useAuthProvider';
import { AuthContextProps, User } from './types';

export const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  signIn: async () => { throw new Error('Not implemented'); },
  signOut: async () => { throw new Error('Not implemented'); },
  signUp: async () => { throw new Error('Not implemented'); },
  loading: true,
  isLoading: true,
  activeSfdId: null,
  setActiveSfdId: () => {},
  isAdmin: false,
  userRole: null,
  verifyBiometricAuth: async () => false,
  biometricEnabled: false,
  toggleBiometricAuth: async () => {},
  hasPermission: () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    session,
    user,
    isLoading,
    signIn: supabaseSignIn,
    signOut: supabaseSignOut,
    signUp: supabaseSignUp,
    hasPermission,
    getUserRole,
    activeSfdId,
    setActiveSfd,
  } = useAuthProvider();

  // Wrapper functions to adapt the interface
  const signIn = async (email: string, password: string, useOtp?: boolean) => {
    return supabaseSignIn(email, password);
  };

  const signOut = async () => {
    return supabaseSignOut();
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    return supabaseSignUp(email, password, { full_name: fullName });
  };

  // Determine if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  // Get user role
  const userRole = user ? getUserRole() : null;

  // Mock biometric functionality for now
  const verifyBiometricAuth = async () => {
    return Promise.resolve(true);
  };

  const biometricEnabled = false;

  const toggleBiometricAuth = async (enabled: boolean) => {
    return Promise.resolve();
  };

  const contextValue: AuthContextProps = {
    session,
    user: user as User | null,
    signIn,
    signOut,
    signUp,
    loading: isLoading,
    isLoading,
    activeSfdId,
    setActiveSfdId: setActiveSfd,
    isAdmin,
    userRole,
    verifyBiometricAuth,
    biometricEnabled,
    toggleBiometricAuth,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
