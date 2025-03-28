
import { AxiosResponse, AxiosError } from 'axios';
import sfdApiClient from './sfdApiClient';
import { sfdCache } from '../cacheUtils';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '../audit';

// Define sensitive operations that should be logged
const SENSITIVE_OPERATIONS = [
  { pattern: '/api/sfd', methods: ['post', 'put', 'patch', 'delete'] },
  { pattern: '/api/loans', methods: ['post', 'put', 'patch', 'delete'] },
  { pattern: '/api/payments', methods: ['post'] },
  { pattern: '/api/users', methods: ['post', 'put', 'patch', 'delete'] },
  { pattern: '/api/subsidies', methods: ['post', 'put', 'patch', 'delete'] }
];

// Check if an operation is sensitive based on URL and method
const isSensitiveOperation = (url: string, method: string): boolean => {
  return SENSITIVE_OPERATIONS.some(op => 
    url.includes(op.pattern) && op.methods.includes(method.toLowerCase())
  );
};

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
      
      // Log any sensitive operations
      if (response.config.url && isSensitiveOperation(response.config.url, response.config.method || '')) {
        const userId = response.config.headers?.['X-User-ID'] as string;
        if (userId) {
          // Check specifically for loan status changes
          let isLoanStatusChange = false;
          let oldStatus = '';
          let newStatus = '';
          
          if (response.config.url.includes('/api/loans') && 
              (response.config.method === 'put' || response.config.method === 'patch')) {
            const requestData = response.config.data ? JSON.parse(response.config.data) : {};
            const responseData = response.data;
            
            if (requestData.status && responseData.status && requestData.status !== responseData.status) {
              isLoanStatusChange = true;
              oldStatus = responseData.status;
              newStatus = requestData.status;
            }
          }
          
          const severity = isLoanStatusChange ? AuditLogSeverity.WARNING : AuditLogSeverity.INFO;
          const category = response.config.url.includes('/api/loans') 
            ? AuditLogCategory.LOAN_OPERATIONS 
            : response.config.url.includes('/api/subsidies')
              ? AuditLogCategory.SUBSIDY_OPERATIONS
              : AuditLogCategory.DATA_ACCESS;
          
          logAuditEvent({
            user_id: userId,
            action: isLoanStatusChange 
              ? 'loan_status_change' 
              : `${response.config.method}_operation`,
            category,
            severity,
            details: {
              url: response.config.url,
              method: response.config.method,
              ...(isLoanStatusChange && { 
                old_status: oldStatus,
                new_status: newStatus
              })
            },
            status: 'success',
            target_resource: response.config.url
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
    // Check for server errors (500)
    if (error.response?.status === 500) {
      // Log the server error
      const config = error.config as any;
      if (config?.headers?.['X-User-ID']) {
        logAuditEvent({
          user_id: config.headers['X-User-ID'],
          action: 'server_error',
          category: AuditLogCategory.SYSTEM,
          severity: AuditLogSeverity.ERROR,
          details: {
            url: config.url,
            method: config.method,
            status: error.response.status
          },
          status: 'failure',
          error_message: error.message,
          target_resource: config.url
        });
        
        // Send alert for server errors
        try {
          fetch('/api/alert-critical-error', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              error_type: 'SERVER',
              message: error.message,
              technical_details: JSON.stringify(error.response?.data),
              status_code: error.response?.status,
              timestamp: new Date().toISOString()
            })
          }).catch(err => console.error("Error sending alert:", err));
        } catch (alertError) {
          console.error("Failed to send error alert:", alertError);
        }
      }
    }
    
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
