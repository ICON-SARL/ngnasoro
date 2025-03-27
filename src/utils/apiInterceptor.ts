
import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { sfdCache } from './cacheUtils';
import { refreshSfdContextToken, shouldRefreshSfdToken, decodeSfdContextToken } from './sfdJwtContext';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from './auditLogger';

// Create an axios instance for SFD-specific API calls
const sfdApiClient = axios.create({
  baseURL: '/api/sfd',
  timeout: 10000
});

// Add a request interceptor to include the SFD context token
sfdApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get the SFD ID from the config (must be provided in each call)
    const sfdId = config.headers?.['X-SFD-ID'] as string;
    const sfdToken = config.headers?.['X-SFD-TOKEN'] as string;
    
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

// Add a response interceptor to handle cached responses and store new responses
sfdApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if this is a cached response
    if (response.config.headers?.['X-From-Cache'] === 'true') {
      const cachedData = JSON.parse(response.config.headers?.['X-Cache-Data'] as string);
      return { ...response, data: cachedData, cached: true };
    }
    
    // For GET requests, store the response in the cache
    if (
      response.config.method?.toLowerCase() === 'get' && 
      response.config.url &&
      response.config.headers?.['X-SFD-ID']
    ) {
      const sfdId = response.config.headers['X-SFD-ID'] as string;
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      
      // Cache the response data
      sfdCache.set(sfdId, cacheKey, response.data);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Log API error
    const config = error.config as InternalAxiosRequestConfig;
    if (config && config.headers) {
      const sfdId = config.headers['X-SFD-ID'] as string;
      const sfdToken = config.headers['X-SFD-TOKEN'] as string;
      
      if (sfdId && sfdToken) {
        try {
          const tokenData = await decodeSfdContextToken(sfdToken);
          if (tokenData) {
            await logAuditEvent({
              user_id: tokenData.userId,
              action: 'sfd_api_error',
              category: AuditLogCategory.DATA_ACCESS,
              severity: AuditLogSeverity.ERROR,
              details: { 
                sfdId, 
                method: config.method,
                url: config.url,
                status: error.response?.status,
                statusText: error.response?.statusText
              },
              status: 'failure',
              error_message: error.message,
              target_resource: `sfd:${sfdId}:${config.url}`
            });
          }
        } catch (e) {
          // Silently fail if we can't log the audit event
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to make SFD-specific API calls
export const callSfdApi = async <T>(
  sfdId: string, 
  sfdToken: string, 
  method: string, 
  endpoint: string, 
  data?: any, 
  params?: any,
  tokenRefreshCallback?: (newToken: string) => void // Callback for token refresh
): Promise<T> => {
  try {
    const response = await sfdApiClient({
      method,
      url: endpoint,
      data,
      params,
      headers: {
        'X-SFD-ID': sfdId,
        'X-SFD-TOKEN': sfdToken
      }
    });
    
    // Check if the token was refreshed during the request
    if (
      response.config.headers?.['X-Token-Refreshed'] === 'true' && 
      response.config.headers?.['X-Refreshed-Token'] && 
      tokenRefreshCallback
    ) {
      const newToken = response.config.headers['X-Refreshed-Token'] as string;
      tokenRefreshCallback(newToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('SFD API call failed:', error);
    throw error;
  }
};
