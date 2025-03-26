
import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { sfdCache } from './cacheUtils';

// Create an axios instance for SFD-specific API calls
const sfdApiClient = axios.create({
  baseURL: '/api/sfd',
  timeout: 10000
});

// Add a request interceptor to include the SFD context token
sfdApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get the SFD ID from the config (must be provided in each call)
    const sfdId = config.headers?.['X-SFD-ID'] as string;
    const sfdToken = config.headers?.['X-SFD-TOKEN'] as string;
    
    if (!sfdId || !sfdToken) {
      throw new Error('SFD ID and token are required for API calls');
    }
    
    // Set the Authorization header with the SFD context token
    // Use the set method of AxiosHeaders instead of direct assignment
    config.headers.set('Authorization', `Bearer ${sfdToken}`);
    
    // Check if the request can be served from cache
    if (config.method?.toLowerCase() === 'get' && config.url) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cachedData = sfdCache.get(sfdId, cacheKey);
      
      if (cachedData) {
        // Set cache headers
        config.headers.set('X-From-Cache', 'true');
        config.headers.set('X-Cache-Data', JSON.stringify(cachedData));
      }
    }
    
    return config;
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
  (error: AxiosError) => {
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
  params?: any
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
    
    return response.data;
  } catch (error) {
    console.error('SFD API call failed:', error);
    throw error;
  }
};
