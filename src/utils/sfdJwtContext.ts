
import * as jose from 'jose';

// Set a secure secret key (in production, this would be stored securely)
const JWT_SECRET = 'your-very-secure-secret-key-for-sfd-context';

// Convert string to Uint8Array for jose library
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Payload type for the SFD JWT
export interface SfdJwtPayload {
  userId: string;
  sfdId: string;
  exp?: number; // Expiration timestamp
  iat?: number; // Issued at timestamp
}

/**
 * Generate a JWT token with SFD context
 */
export const generateSfdContextToken = async (userId: string, sfdId: string): Promise<string> => {
  const payload: SfdJwtPayload = {
    userId,
    sfdId
  };
  
  // Set the token to expire in 1 hour
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);
};

/**
 * Decode and verify a JWT token with SFD context
 */
export const decodeSfdContextToken = async (token: string): Promise<SfdJwtPayload | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    // Add proper type assertion after verifying the payload structure
    if (typeof payload.userId === 'string' && typeof payload.sfdId === 'string') {
      return {
        userId: payload.userId,
        sfdId: payload.sfdId,
        exp: payload.exp,
        iat: payload.iat
      };
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
  const decoded = await decodeSfdContextToken(token);
  return decoded !== null && decoded.sfdId === targetSfdId;
};
