
import { AxiosResponse, AxiosError } from 'axios';
import sfdApiClient from './sfdApiClient';
import { sfdCache } from '../cacheUtils';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '../audit';

// Add a response interceptor to cache GET responses and handle errors
sfdApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    try {
      // Check if this is a modification to SFD data and log it
      if (response.config.url?.includes('/api/sfd') && 
          (response.config.method === 'post' || response.config.method === 'put' || response.config.method === 'patch')) {
        
        const sfdId = response.config.headers?.['X-SFD-ID'] as string;
        const userRole = response.config.headers?.['X-User-Role'] as string;
        const userId = response.config.headers?.['X-User-ID'] as string;
        
        // Extract modified fields by comparing with original data (if available)
        const requestData = response.config.data ? JSON.parse(response.config.data) : {};
        const responseData = response.data;
        
        const modifiedFields = Object.keys(requestData).reduce((acc: Record<string, any>, key: string) => {
          if (requestData[key] !== responseData[key]) {
            acc[key] = {
              from: responseData[key],
              to: requestData[key]
            };
          }
          return acc;
        }, {});
        
        // Log the audit event for SFD modification
        if (Object.keys(modifiedFields).length > 0) {
          logAuditEvent({
            user_id: userId,
            action: response.config.method === 'post' ? 'create_sfd' : 'update_sfd',
            category: AuditLogCategory.SFD_OPERATIONS,
            severity: AuditLogSeverity.INFO,
            details: {
              sfd_id: sfdId,
              modified_fields: modifiedFields
            },
            status: 'success',
            target_resource: `sfd:${responseData.id || sfdId}`
          });
        }
      }
      
      // Cache handling for GET requests
      if (response.config.method?.toLowerCase() === 'get' && response.config.url) {
        const sfdId = response.config.headers?.['X-SFD-ID'] as string;
        
        if (sfdId) {
          const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
          sfdCache.set(sfdId, cacheKey, response.data);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Response interceptor error:', error);
      return response; // Return original response even if there was an error in caching
    }
  },
  (error: AxiosError) => {
    // Check for permission errors (403)
    if (error.response?.status === 403) {
      // Log the permission denial
      const config = error.config as any;
      if (config?.headers?.['X-User-ID']) {
        logAuditEvent({
          user_id: config.headers['X-User-ID'],
          action: 'permission_denied',
          category: AuditLogCategory.ACCESS_CONTROL,
          severity: AuditLogSeverity.WARNING,
          details: {
            url: config.url,
            method: config.method,
            role: config.headers['X-User-Role']
          },
          status: 'failure',
          error_message: error.message,
          target_resource: config.url
        });
      }
    }
    
    return Promise.reject(error);
  }
);
