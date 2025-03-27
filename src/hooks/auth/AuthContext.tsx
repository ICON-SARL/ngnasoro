
import { createContext } from 'react';
import { AuthContextProps } from './types';

// Create the auth context with default values
const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  isLoading: true,
  loading: true,
  activeSfdId: null,
  setActiveSfdId: () => {},
  isAdmin: false,
  signUp: async () => {},
  verifyBiometricAuth: async () => false,
  biometricEnabled: false,
  toggleBiometricAuth: async () => {},
});

export default AuthContext;
