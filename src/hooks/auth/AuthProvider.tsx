
import React, { createContext, ReactNode } from 'react';
import { useAuthProvider } from './useAuthProvider';
import { AuthContextProps, User, AuthResponse } from './types';
import AuthContext from './AuthContext';

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

  // Helper function to transform Supabase User to our User type
  const transformUser = (supabaseUser: any): User | null => {
    if (!supabaseUser) return null;
    
    return {
      ...supabaseUser,
      full_name: supabaseUser.user_metadata?.full_name || '',
      email: supabaseUser.email || '',
      aud: supabaseUser.aud || '',
      created_at: supabaseUser.created_at || '',
    };
  };

  // Wrapper functions to adapt the interface
  const signIn = async (email: string, password: string, useOtp?: boolean): Promise<AuthResponse> => {
    const result = await supabaseSignIn(email, password);
    return {
      user: transformUser(result.user),
      session: result.session,
      error: result.error,
    };
  };

  const signOut = async () => {
    return supabaseSignOut();
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const result = await supabaseSignUp(email, password, { full_name: fullName });
    return {
      user: transformUser(result.user),
      session: result.session,
      error: result.error,
    };
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
    user: transformUser(user),
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
