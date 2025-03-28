
import { AxiosRequestConfig } from 'axios';
import sfdApiClient from './sfdApiClient';
import { useAuth } from '@/hooks/auth';

// Import interceptors to ensure they're registered
import './requestInterceptor';
import './responseInterceptor';

// Function to make SFD-specific API calls
export const callSfdApi = async <T>(
  sfdId: string, 
  sfdToken: string, 
  method: string, 
  endpoint: string, 
  data?: any, 
  params?: any,
  userRole?: string, // Add userRole parameter
  tokenRefreshCallback?: (newToken: string) => void // Callback for token refresh
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      params,
      headers: {
        'X-SFD-ID': sfdId,
        'X-SFD-TOKEN': sfdToken,
        'X-User-Role': userRole || 'user' // Default to 'user' if not provided
      }
    };

    const response = await sfdApiClient(config);
    
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
  } catch (error: any) {
    // Check if it's a permission error (403 Forbidden)
    if (error.response && error.response.status === 403) {
      console.error('Permission denied for API call:', endpoint);
      throw new Error(`Access denied: Insufficient permissions to access ${endpoint}`);
    }
    
    console.error('SFD API call failed:', error);
    throw error;
  }
};

// Hook wrapper for the callSfdApi function that automatically adds the user role
export const useRoleBasedApi = () => {
  const { userRole } = useAuth();
  
  const callWithRole = async <T>(
    sfdId: string,
    sfdToken: string,
    method: string,
    endpoint: string,
    data?: any,
    params?: any,
    tokenRefreshCallback?: (newToken: string) => void
  ): Promise<T> => {
    return callSfdApi<T>(
      sfdId,
      sfdToken,
      method,
      endpoint,
      data,
      params,
      userRole || 'user',
      tokenRefreshCallback
    );
  };
  
  return {
    callApi: callWithRole
  };
};
