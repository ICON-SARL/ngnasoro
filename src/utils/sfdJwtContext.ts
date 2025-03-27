
import * as jose from 'jose';
import { EncryptionService } from './encryption';

// Set a secure secret key (in production, this would be stored securely)
const JWT_SECRET = 'your-very-secure-secret-key-for-sfd-context';

// Convert string to Uint8Array for jose library
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Encryption key for additional AES-256 encryption layer
const AES_ENCRYPTION_KEY = 'sfd-secure-aes-256-encryption-key-do-not-share';

// Payload type for the SFD JWT
export interface SfdJwtPayload extends jose.JWTPayload {
  userId: string;
  sfdId: string;
  exp?: number; // Expiration timestamp
  iat?: number; // Issued at timestamp
}

/**
 * Generate a JWT token with SFD context, enhanced with AES-256 encryption
 */
export const generateSfdContextToken = async (userId: string, sfdId: string): Promise<string> => {
  try {
    const payload: SfdJwtPayload = {
      userId,
      sfdId
    };
    
    // First create the JWT token
    const jwtToken = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secretKey);
      
    // Add an additional layer of AES-256 encryption
    return EncryptionService.encrypt(jwtToken, AES_ENCRYPTION_KEY);
  } catch (error) {
    console.error('Error generating SFD context token:', error);
    throw new Error('Failed to generate secure token');
  }
};

/**
 * Decode and verify a JWT token with SFD context
 */
export const decodeSfdContextToken = async (token: string): Promise<SfdJwtPayload | null> => {
  if (!token) {
    console.error('No token provided for decoding');
    return null;
  }
  
  try {
    // First decrypt the AES layer
    const jwtToken = EncryptionService.decrypt(token, AES_ENCRYPTION_KEY);
    
    // Then verify the JWT token
    const { payload } = await jose.jwtVerify(jwtToken, secretKey);
    
    // Add proper type assertion after verifying the payload structure
    if (typeof payload.userId === 'string' && typeof payload.sfdId === 'string') {
      return payload as SfdJwtPayload;
    }
    
    console.error('Invalid payload structure:', payload);
    return null;
  } catch (error) {
    console.error('Error decoding SFD JWT token:', error);
    return null;
  }
};

/**
 * Check if the user has access to a specific SFD
 */
export const hasAccessToSfd = async (token: string, targetSfdId: string): Promise<boolean> => {
  if (!token || !targetSfdId) {
    return false;
  }
  
  const decoded = await decodeSfdContextToken(token);
  return decoded !== null && decoded.sfdId === targetSfdId;
};
