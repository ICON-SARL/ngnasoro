
import { createContext } from 'react';
import { AuthContextProps } from './types';

const defaultContext: AuthContextProps = {
  session: null,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
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
