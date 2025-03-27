
import { EncryptionService } from './encryptionService';

/**
 * Utility for secure token generation and verification
 */
export class SecureTokenService {
  private static readonly DEFAULT_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds
  
  /**
   * Generate a secure token with payload
   * @param payload - Data to include in the token
   * @param secretKey - Secret key for encryption
   * @param expiryMs - Token expiry time in milliseconds (defaults to 15 minutes)
   * @returns Encrypted token
   */
  static generateToken(
    payload: Record<string, any>,
    secretKey: string,
    expiryMs = this.DEFAULT_EXPIRY
  ): string {
    const expiresAt = Date.now() + expiryMs;
    const tokenData = {
      ...payload,
      exp: expiresAt
    };
    
    return EncryptionService.encrypt(tokenData, secretKey);
  }
  
  /**
   * Verify and decode a secure token
   * @param token - Token to verify
   * @param secretKey - Secret key for decryption
   * @returns Decoded payload if valid, null if expired or invalid
   */
  static verifyToken(token: string, secretKey: string): Record<string, any> | null {
    try {
      const decrypted = EncryptionService.decrypt(token, secretKey);
      const data = typeof decrypted === 'string' 
        ? EncryptionService.parseDecrypted(decrypted) 
        : decrypted;
      
      // Check if token is expired
      if (typeof data === 'object' && data.exp && data.exp > Date.now()) {
        return data;
      }
      
      return null; // Token is expired
    } catch (error) {
      console.error('Token verification failed:', error);
      return null; // Invalid token
    }
  }
}
