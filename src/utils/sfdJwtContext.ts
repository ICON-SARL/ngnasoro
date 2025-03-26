
import jwt from 'jsonwebtoken';

// Set a secure secret key (in production, this would be stored securely)
const JWT_SECRET = 'your-very-secure-secret-key-for-sfd-context';

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
export const generateSfdContextToken = (userId: string, sfdId: string): string => {
  const payload: Omit<SfdJwtPayload, 'exp' | 'iat'> = {
    userId,
    sfdId
  };
  
  // Set the token to expire in 1 hour
  return jwt.sign(payload, JWT_SECRET, { 
    algorithm: 'HS512',
    expiresIn: '1h' 
  });
};

/**
 * Decode and verify a JWT token with SFD context
 */
export const decodeSfdContextToken = (token: string): SfdJwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'] }) as SfdJwtPayload;
  } catch (error) {
    console.error('Error decoding SFD JWT token:', error);
    return null;
  }
};

/**
 * Check if the user has access to a specific SFD
 */
export const hasAccessToSfd = (token: string, targetSfdId: string): boolean => {
  const decoded = decodeSfdContextToken(token);
  return decoded !== null && decoded.sfdId === targetSfdId;
};
