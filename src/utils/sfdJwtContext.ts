
import * as jose from 'jose';

// Set a secure secret key (in production, this would be stored securely)
const JWT_SECRET = 'your-very-secure-secret-key-for-sfd-context';

// Convert string to Uint8Array for jose library
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Payload type for the SFD JWT
interface SfdJwtPayload {
  userId: string;
  sfdId: string;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

/**
 * Generate a JWT token with SFD context
 */
export const generateSfdContextToken = async (userId: string, sfdId: string): Promise<string> => {
  const payload = {
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
    return payload as SfdJwtPayload;
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
