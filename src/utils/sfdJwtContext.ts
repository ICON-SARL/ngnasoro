
import * as jose from 'jose';
import { EncryptionService } from './crypto';
import { SecureTokenService } from './crypto';
import { logAuditEvent } from './audit';
import { AuditLogCategory, AuditLogSeverity } from './audit/auditLoggerTypes';

// Set a secure secret key (in production, this would be stored securely)
const JWT_SECRET = 'your-very-secure-secret-key-for-sfd-context';

// Convert string to Uint8Array for jose library
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Encryption key for additional AES-256 encryption layer
const AES_ENCRYPTION_KEY = 'sfd-secure-aes-256-encryption-key-do-not-share';

// Default token expiration time: 1 hour
const DEFAULT_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

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
export const generateSfdContextToken = async (
  userId: string, 
  sfdId: string, 
  expiryMs = DEFAULT_TOKEN_EXPIRY
): Promise<string> => {
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
    const encryptedToken = EncryptionService.encrypt(jwtToken, AES_ENCRYPTION_KEY);
    
    // Log token generation
    await logAuditEvent({
      user_id: userId,
      action: 'generate_sfd_token',
      category: AuditLogCategory.TOKEN_MANAGEMENT,
      severity: AuditLogSeverity.INFO,
      details: { sfdId },
      status: 'success',
      target_resource: `sfd:${sfdId}`
    });
    
    return encryptedToken;
  } catch (error) {
    console.error('Error generating SFD context token:', error);
    
    // Log token generation failure
    await logAuditEvent({
      user_id: userId,
      action: 'generate_sfd_token',
      category: AuditLogCategory.TOKEN_MANAGEMENT,
      severity: AuditLogSeverity.ERROR,
      details: { sfdId, error: String(error) },
      status: 'failure',
      error_message: String(error),
      target_resource: `sfd:${sfdId}`
    });
    
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
 * Check if the SFD context token needs to be refreshed
 */
export const shouldRefreshSfdToken = async (token: string): Promise<boolean> => {
  if (!token) return true;
  
  try {
    // First decrypt the AES layer
    const jwtToken = EncryptionService.decrypt(token, AES_ENCRYPTION_KEY);
    
    // Extract payload without verification to check expiration
    const payload = jose.decodeJwt(jwtToken) as SfdJwtPayload;
    
    if (!payload.exp) return true;
    
    // Convert exp to milliseconds (JWT exp is in seconds)
    const expMs = payload.exp * 1000;
    const now = Date.now();
    
    // Refresh if less than 10 minutes remaining
    const TEN_MINUTES = 10 * 60 * 1000;
    return expMs - now < TEN_MINUTES;
  } catch (error) {
    console.error('Error checking SFD token refresh status:', error);
    
    // Log token check failure
    if (error instanceof Error) {
      try {
        const tokenData = await decodeSfdContextToken(token);
        if (tokenData) {
          await logAuditEvent({
            user_id: tokenData.userId,
            action: 'check_token_refresh',
            category: AuditLogCategory.TOKEN_MANAGEMENT,
            severity: AuditLogSeverity.WARNING,
            details: { error: error.message },
            status: 'failure',
            error_message: error.message,
            target_resource: `sfd:${tokenData.sfdId}`
          });
        }
      } catch (e) {
        // Silently fail if we can't log the audit event
      }
    }
    
    return true; // Refresh on error
  }
};

/**
 * Refresh an SFD context token if needed
 */
export const refreshSfdContextToken = async (token: string): Promise<string | null> => {
  if (!token) return null;
  
  try {
    // First decrypt the AES layer
    const jwtToken = EncryptionService.decrypt(token, AES_ENCRYPTION_KEY);
    
    // Then verify the JWT token
    const { payload } = await jose.jwtVerify(jwtToken, secretKey);
    
    // Check if need to refresh
    const needsRefresh = await shouldRefreshSfdToken(token);
    
    if (needsRefresh && typeof payload.userId === 'string' && typeof payload.sfdId === 'string') {
      // Generate a new token with the same user and SFD information
      const newToken = await generateSfdContextToken(payload.userId, payload.sfdId);
      
      // Log token refresh
      await logAuditEvent({
        user_id: payload.userId,
        action: 'refresh_sfd_token',
        category: AuditLogCategory.TOKEN_MANAGEMENT,
        severity: AuditLogSeverity.INFO,
        details: { sfdId: payload.sfdId },
        status: 'success',
        target_resource: `sfd:${payload.sfdId}`
      });
      
      return newToken;
    }
    
    return token; // Return original token if refresh not needed
  } catch (error) {
    console.error('Error refreshing SFD context token:', error);
    
    // Try to log the failure, but don't throw if we can't get the user data
    try {
      const tokenData = await decodeSfdContextToken(token);
      if (tokenData) {
        await logAuditEvent({
          user_id: tokenData.userId,
          action: 'refresh_sfd_token',
          category: AuditLogCategory.TOKEN_MANAGEMENT,
          severity: AuditLogSeverity.ERROR,
          details: { sfdId: tokenData.sfdId, error: String(error) },
          status: 'failure',
          error_message: String(error),
          target_resource: `sfd:${tokenData.sfdId}`
        });
      }
    } catch (e) {
      // Silently fail if we can't log the audit event
    }
    
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
  const hasAccess = decoded !== null && decoded.sfdId === targetSfdId;
  
  // Log access check
  if (decoded) {
    await logAuditEvent({
      user_id: decoded.userId,
      action: 'check_sfd_access',
      category: AuditLogCategory.DATA_ACCESS,
      severity: AuditLogSeverity.INFO,
      details: { 
        sfdId: targetSfdId,
        hasAccess: hasAccess
      },
      status: hasAccess ? 'success' : 'failure',
      target_resource: `sfd:${targetSfdId}`
    });
  }
  
  return hasAccess;
};
