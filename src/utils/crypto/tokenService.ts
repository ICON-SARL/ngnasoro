
import { EncryptionService } from './encryptionService';

/**
 * Utility for secure token generation and verification with rotation support
 */
export class SecureTokenService {
  private static readonly DEFAULT_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds
  private static readonly REFRESH_WINDOW = 5 * 60 * 1000; // 5 minutes refresh window before expiry
  
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
      exp: expiresAt,
      iat: Date.now() // Issued at timestamp
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
  
  /**
   * Check if a token needs to be refreshed (close to expiry)
   * @param token - Token to check
   * @param secretKey - Secret key for decryption
   * @returns true if token needs refreshing, false otherwise
   */
  static shouldRefreshToken(token: string, secretKey: string): boolean {
    try {
      const decrypted = EncryptionService.decrypt(token, secretKey);
      const data = typeof decrypted === 'string' 
        ? EncryptionService.parseDecrypted(decrypted) 
        : decrypted;
      
      if (typeof data === 'object' && data.exp) {
        // Check if token is within the refresh window (5 minutes before expiration)
        return data.exp - Date.now() <= this.REFRESH_WINDOW;
      }
      
      return true; // If no expiration found, refresh anyway
    } catch (error) {
      console.error('Token refresh check failed:', error);
      return true; // If error occurs, refresh token
    }
  }
  
  /**
   * Refresh a token if it's close to expiry or has expired
   * @param token - Current token
   * @param secretKey - Secret key for encryption/decryption
   * @param newExpiryMs - New expiry time in milliseconds
   * @returns New token if refreshed, original token if not needed, null if invalid
   */
  static refreshToken(
    token: string, 
    secretKey: string,
    newExpiryMs = this.DEFAULT_EXPIRY
  ): string | null {
    // First verify if token is still valid
    const payload = this.verifyToken(token, secretKey);
    
    if (!payload) {
      return null; // Invalid or expired token
    }
    
    // Check if token needs refreshing
    if (this.shouldRefreshToken(token, secretKey)) {
      // Remove expiration and issuance timestamps from old payload
      const { exp, iat, ...rest } = payload;
      
      // Generate new token with updated expiry
      return this.generateToken(rest, secretKey, newExpiryMs);
    }
    
    // Token still valid and not close to expiry
    return token;
  }
}
