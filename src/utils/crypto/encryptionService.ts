
import * as crypto from 'crypto-js';

/**
 * Utility class for AES-256 encryption and decryption operations
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'AES-256';
  private static readonly IV_LENGTH = 16; // For AES, this is always 16 bytes
  private static readonly KEY_SIZE = 32; // 256 bits = 32 bytes
  
  /**
   * Encrypt data using AES-256 CBC mode
   * @param data - Data to encrypt (string or object that will be stringified)
   * @param encryptionKey - Secret key for encryption
   * @returns Encrypted data as a string (IV + ciphertext, base64 encoded)
   */
  static encrypt(data: string | object, encryptionKey: string): string {
    // If data is an object, stringify it
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
    
    // Use key derivation to ensure proper key length
    const key = crypto.PBKDF2(encryptionKey, crypto.lib.WordArray.random(16), {
      keySize: this.KEY_SIZE / 4, // keySize is in words (4 bytes per word)
      iterations: 1000
    });
    
    // Generate a random IV
    const iv = crypto.lib.WordArray.random(this.IV_LENGTH);
    
    // Encrypt using AES in CBC mode with the derived key and IV
    const encrypted = crypto.AES.encrypt(dataString, key, {
      iv: iv,
      padding: crypto.pad.Pkcs7,
      mode: crypto.mode.CBC
    });
    
    // Combine IV and ciphertext and encode as base64
    const ivAndCiphertext = iv.concat(encrypted.ciphertext);
    return crypto.enc.Base64.stringify(ivAndCiphertext);
  }
  
  /**
   * Decrypt data that was encrypted with AES-256 CBC mode
   * @param encryptedData - Encrypted data (IV + ciphertext, base64 encoded)
   * @param encryptionKey - Secret key for decryption (same as used for encryption)
   * @returns Decrypted data as a string
   */
  static decrypt(encryptedData: string, encryptionKey: string): string {
    try {
      // Decode the base64 data
      const ivAndCiphertext = crypto.enc.Base64.parse(encryptedData);
      
      // Extract the IV from the beginning of the data
      const iv = crypto.lib.WordArray.create(
        ivAndCiphertext.words.slice(0, this.IV_LENGTH / 4),
        this.IV_LENGTH
      );
      
      // Extract the ciphertext (everything after the IV)
      const ciphertext = crypto.lib.WordArray.create(
        ivAndCiphertext.words.slice(this.IV_LENGTH / 4),
        ivAndCiphertext.sigBytes - this.IV_LENGTH
      );
      
      // Derive the key (same as during encryption)
      const key = crypto.PBKDF2(encryptionKey, iv, {
        keySize: this.KEY_SIZE / 4,
        iterations: 1000
      });
      
      // Recreate the encrypted object with the extracted components
      const encrypted = crypto.lib.CipherParams.create({
        ciphertext: ciphertext,
        key: key,
        iv: iv,
        algorithm: crypto.algo.AES,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
        blockSize: 4,
        formatter: crypto.format.OpenSSL
      });
      
      // Decrypt the data
      const decrypted = crypto.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: crypto.pad.Pkcs7,
        mode: crypto.mode.CBC
      });
      
      return crypto.enc.Utf8.stringify(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }
  
  /**
   * Attempt to parse decrypted data as JSON
   * @param decryptedData - Decrypted data string
   * @returns Parsed JSON object or original string if parsing fails
   */
  static parseDecrypted(decryptedData: string): any {
    try {
      return JSON.parse(decryptedData);
    } catch (e) {
      return decryptedData;
    }
  }
  
  /**
   * Generate a secure encryption key
   * @returns Randomly generated encryption key
   */
  static generateKey(): string {
    return crypto.lib.WordArray.random(this.KEY_SIZE).toString(crypto.enc.Hex);
  }
}
