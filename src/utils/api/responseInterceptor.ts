
import { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import sfdApiClient from './sfdApiClient';
import { sfdCache } from '../cacheUtils';
import { decodeSfdContextToken } from '../sfdJwtContext';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '../auditLogger';

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
