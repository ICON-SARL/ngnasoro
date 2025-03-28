
import { createContext } from 'react';
import { AuthContextProps } from './types';

const defaultContext: AuthContextProps = {
  session: null,
  user: null,
  signIn: async () => ({ user: null, session: null, error: null }),
  signOut: async () => ({ error: null }),
  signUp: async () => ({ user: null, session: null, error: null }),
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
};

const AuthContext = createContext<AuthContextProps>(defaultContext);

export default AuthContext;
