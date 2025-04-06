
import * as React from 'react';
import { createContext, useContext } from 'react';
import { AuthContextProps, Role, User } from './types';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './authOperations';
import { createUserFromSupabaseUser } from './authUtils';

interface AuthContextType extends AuthContextProps { }

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => { },
  signIn: async () => ({}),
  signUp: async () => ({}),
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
  const {
    user,
    setUser,
    session,
    setSession,
    loading,
    activeSfdId,
    setActiveSfdId,
    biometricEnabled,
    toggleBiometricAuth,
    isAdmin,
    isSfdAdmin,
    userRole,
    isLoggedIn
  } = useAuthState();

  const {
    signIn: authSignIn,
    signUp: authSignUp,
    signOut: authSignOut,
    refreshSession: authRefreshSession,
    isLoading
  } = useAuthOperations();

  const signIn = async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    if (result.data?.session) {
      setSession(result.data.session);
      if (result.data.session.user) {
        const mappedUser = createUserFromSupabaseUser(result.data.session.user);
        setUser(mappedUser);
      }
    }
    return result;
  };

  const signUp = async (email: string, password: string, metadata: Record<string, any> = {}) => {
    return authSignUp(email, password, metadata);
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
  };

  const refreshSession = async () => {
    const data = await authRefreshSession();
    if (data?.session) {
      setSession(data.session);
      if (data.session.user) {
        const mappedUser = createUserFromSupabaseUser(data.session.user);
        setUser(mappedUser);
      }
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    signIn,
    signUp,
    signOut,
    loading,
    isLoggedIn,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
