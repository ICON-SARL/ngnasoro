
import { useState, useCallback } from 'react';
import { SecureStorage } from '@/utils/encryption';

/**
 * Custom hook for using secure encrypted storage
 * @param storageKey - Key used for localStorage
 * @param encryptionKey - Key used for encryption/decryption
 * @returns Object with methods to interact with secure storage
 */
export function useSecureStorage<T>(storageKey: string, encryptionKey: string) {
  const secureStorage = new SecureStorage(storageKey, encryptionKey);
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    return secureStorage.getItem<T>();
  });
  
  // Set a new value in secure storage
  const setValue = useCallback((value: T) => {
    try {
      secureStorage.setItem(value);
      setStoredValue(value);
    } catch (error) {
      console.error('Error setting secure storage value:', error);
    }
  }, [secureStorage]);
  
  // Remove the value from secure storage
  const removeValue = useCallback(() => {
    try {
      secureStorage.removeItem();
      setStoredValue(null);
    } catch (error) {
      console.error('Error removing secure storage value:', error);
    }
  }, [secureStorage]);
  
  return {
    value: storedValue,
    setValue,
    removeValue,
    secureStorage
  };
}
