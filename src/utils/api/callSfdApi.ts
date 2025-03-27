
import { AxiosRequestConfig } from 'axios';
import sfdApiClient from './sfdApiClient';

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
        'X-SFD-TOKEN': sfdToken
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
  } catch (error) {
    console.error('SFD API call failed:', error);
    throw error;
  }
};
