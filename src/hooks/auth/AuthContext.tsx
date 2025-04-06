
import React, { createContext, useContext } from 'react';
import { User, AuthContextProps, Role, AuthResponse } from './types';
import { isUserAdmin, isUserSfdAdmin, getUserRole } from './authUtils';
import { useAuthState } from './useAuthState';
import { useAuthListeners } from './useAuthListeners';
import { useAuthMethods } from './useAuthMethods';

interface AuthContextType extends AuthContextProps { }

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => { },
  signIn: async () => ({}),
  signUp: async () => ({ error: undefined, data: undefined }),
  signOut: async () => { },
  loading: true,
  isLoggedIn: false,
  isAdmin: false,
  isSfdAdmin: false,
  activeSfdId: null,
  setActiveSfdId: () => { },
  userRole: null,
  biometricEnabled: false,
  toggleBiometricAuth: async () => { },
  session: null,
  isLoading: false,
  refreshSession: async () => { }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get auth state (user, session, loading, etc.)
  const {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    activeSfdId,
    setActiveSfdId,
    biometricEnabled
  } = useAuthState();

  // Set up auth listeners (onAuthStateChange, getSession)
  useAuthListeners(setUser, setSession, setLoading);

  // Get auth methods (signIn, signOut, etc.)
  const {
    signIn,
    signUp,
    signOut,
    refreshSession,
    toggleBiometricAuth,
    isLoading
  } = useAuthMethods(setUser, setSession);

  // Compute derived state
  const isAdmin = isUserAdmin(user);
  const isSfdAdmin = isUserSfdAdmin(user);
  const userRole = getUserRole(user) as Role | null;

  const value: AuthContextType = {
    user,
    setUser,
    signIn,
    signUp,
    signOut,
    loading,
    isLoggedIn: !!user,
    isAdmin,
    isSfdAdmin,
    activeSfdId,
    setActiveSfdId,
    userRole,
    biometricEnabled,
    toggleBiometricAuth,
    session,
    isLoading,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
