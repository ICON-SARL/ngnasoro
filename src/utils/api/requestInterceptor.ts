
import { InternalAxiosRequestConfig, AxiosError } from 'axios';
import sfdApiClient from './sfdApiClient';
import { sfdCache } from '../cacheUtils';
import { refreshSfdContextToken, shouldRefreshSfdToken, decodeSfdContextToken } from '../sfdJwtContext';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '../auditLogger';

// Add a request interceptor to include the SFD context token
sfdApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get the SFD ID from the config (must be provided in each call)
    const sfdId = config.headers?.['X-SFD-ID'] as string;
    const sfdToken = config.headers?.['X-SFD-TOKEN'] as string;
    const userRole = config.headers?.['X-User-Role'] as string || 'user'; // Default to 'user' if not provided
    
    if (!sfdId || !sfdToken) {
      throw new Error('SFD ID and token are required for API calls');
    }
    
    try {
      // Check if the token needs to be refreshed
      const needsRefresh = await shouldRefreshSfdToken(sfdToken);
      
      let tokenToUse = sfdToken;
      
      if (needsRefresh) {
        // Refresh the token
        const refreshedToken = await refreshSfdContextToken(sfdToken);
        
        if (refreshedToken) {
          tokenToUse = refreshedToken;
          // Signal that the token has been refreshed (for the caller to update)
          config.headers?.set('X-Token-Refreshed', 'true');
          config.headers?.set('X-Refreshed-Token', refreshedToken);
        }
      }
      
      // Set the Authorization header with the SFD context token
      config.headers?.set('Authorization', `Bearer ${tokenToUse}`);
      
      // Check if the request can be served from cache
      if (config.method?.toLowerCase() === 'get' && config.url) {
        const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
        const cachedData = sfdCache.get(sfdId, cacheKey);
        
        if (cachedData) {
          // Set cache headers
          config.headers?.set('X-From-Cache', 'true');
          config.headers?.set('X-Cache-Data', JSON.stringify(cachedData));
        }
      }
      
      // Log the API request
      const tokenData = await decodeSfdContextToken(tokenToUse);
      if (tokenData) {
        await logAuditEvent({
          user_id: tokenData.userId,
          action: 'sfd_api_request',
          category: AuditLogCategory.DATA_ACCESS,
          severity: AuditLogSeverity.INFO,
          details: { 
            sfdId, 
            userRole,
            method: config.method,
            url: config.url,
            fromCache: !!config.headers?.['X-From-Cache']
          },
          status: 'success',
          target_resource: `sfd:${sfdId}:${config.url}`
        });
      }
      
      return config;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Log the failure
      try {
        const tokenData = await decodeSfdContextToken(sfdToken);
        if (tokenData) {
          await logAuditEvent({
            user_id: tokenData.userId,
            action: 'token_refresh_error',
            category: AuditLogCategory.TOKEN_MANAGEMENT,
            severity: AuditLogSeverity.ERROR,
            details: { 
              sfdId,
              error: String(error)
            },
            status: 'failure',
            error_message: String(error),
            target_resource: `sfd:${sfdId}`
          });
        }
      } catch (e) {
        // Silently fail if we can't log the audit event
      }
      
      return config; // Proceed with original token
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
