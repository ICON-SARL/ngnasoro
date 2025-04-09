
import { SecureStorage } from '@/utils/crypto/secureStorage';

// Constants for biometric storage
const BIOMETRIC_STORAGE_KEY = 'meref_biometric_enabled';
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'secure_meref_key';

// Create a secure storage instance
export const secureStorage = new SecureStorage(BIOMETRIC_STORAGE_KEY, ENCRYPTION_KEY);

// Utility function to check biometric settings
export const getBiometricSettings = (): boolean => {
  const storedSettings = secureStorage.getItem<{ enabled: boolean }>();
  return !!storedSettings?.enabled;
};

// Utility function to toggle biometric authentication
export const toggleBiometricAuthentication = (currentState: boolean): boolean => {
  const newState = !currentState;
  secureStorage.setItem({ enabled: newState });
  return newState;
};
