
import { EncryptionService } from './encryptionService';

/**
 * Secure data storage utility for sensitive data
 */
export class SecureStorage {
  private readonly storageKey: string;
  private readonly encryptionKey: string;
  
  /**
   * Create a secure storage instance
   * @param storageKey - Key used for localStorage
   * @param encryptionKey - Key used for encryption/decryption
   */
  constructor(storageKey: string, encryptionKey: string) {
    this.storageKey = storageKey;
    this.encryptionKey = encryptionKey;
  }
  
  /**
   * Store data securely
   * @param data - Data to store securely
   */
  setItem(data: any): void {
    const encrypted = EncryptionService.encrypt(data, this.encryptionKey);
    localStorage.setItem(this.storageKey, encrypted);
  }
  
  /**
   * Retrieve and decrypt stored data
   * @returns Decrypted data or null if not found
   */
  getItem<T = any>(): T | null {
    const encrypted = localStorage.getItem(this.storageKey);
    
    if (!encrypted) {
      return null;
    }
    
    try {
      const decrypted = EncryptionService.decrypt(encrypted, this.encryptionKey);
      return EncryptionService.parseDecrypted(decrypted);
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }
  
  /**
   * Remove stored data
   */
  removeItem(): void {
    localStorage.removeItem(this.storageKey);
  }
}
