
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';

interface CallOptions {
  showToast?: boolean;
  requireAuth?: boolean;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export const edgeFunctionApi = {
  /**
   * Generic method to call Supabase Edge Functions with better error handling
   */
  async callEdgeFunction(functionName: string, payload: any = {}, options: CallOptions = {}) {
    const { 
      showToast = true, 
      requireAuth = true, 
      timeout = 55000,  // Augmenté à 55 secondes
      maxRetries = 3,
      retryDelay = 1000
    } = options;
    
    console.log(`Calling edge function: ${functionName}`, payload);
    
    try {
      // Set up a timeout promise to prevent hanging on API calls
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Edge function call to ${functionName} timed out after ${timeout/1000} seconds`)), timeout);
      });
      
      // Check network connectivity before making the API call
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      // Call the edge function with a retry mechanism
      const callWithRetry = async (retriesLeft = maxRetries, delay = retryDelay): Promise<any> => {
        try {
          // Add a small random delay to avoid simultaneous requests
          const jitter = Math.floor(Math.random() * 500);
          await new Promise(resolve => setTimeout(resolve, jitter));
          
          console.log(`Attempting to call ${functionName}, attempts left: ${retriesLeft}`);
          
          const response = await supabase.functions.invoke(functionName, {
            body: payload,
          });
          
          // Check if the response has an error
          if (response.error) {
            console.error(`Error response from ${functionName}:`, response.error);
            
            // Format non-2xx status error differently
            if (response.error.message && response.error.message.includes('non-2xx status')) {
              throw new Error(`Edge Function returned an error status. Details: ${response.error.message}`);
            }
            
            throw response.error;
          }
          
          console.log(`Successfully called ${functionName}`, response.data);
          return response.data;
        } catch (err: any) {
          console.error(`Error in attempt for ${functionName}, retries left: ${retriesLeft-1}`, err);
          
          // Check if we should retry based on error type
          const shouldRetry = retriesLeft > 1 && (
            err.message?.includes('Failed to fetch') || 
            err.message?.includes('timed out') ||
            err.message?.includes('non-2xx status') ||
            err.status === 429 || // Too many requests
            (err.status >= 500 && err.status < 600) // Server errors
          );
          
          if (!shouldRetry) {
            console.error(`No more retries for ${functionName} or error not retriable`);
            throw err;
          }
          
          // Calculate exponential backoff with jitter
          const backoffDelay = Math.min(delay * (1.5 + Math.random() * 0.5), 15000);
          console.log(`Retrying ${functionName} in ${backoffDelay}ms, attempts left: ${retriesLeft-1}`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return callWithRetry(retriesLeft - 1, backoffDelay);
        }
      };
      
      // Race the function call against the timeout
      const data = await Promise.race([
        callWithRetry(maxRetries, retryDelay),
        timeoutPromise
      ]);
      
      return data;
    } catch (error: any) {
      console.error(`Error in callEdgeFunction for ${functionName}:`, error);
      
      // Format the error message to be more user-friendly
      let errorMessage = error.message || `Error when calling ${functionName}`;
      
      // Try to parse JSON error message if possible
      if (error.message && (error.message.startsWith('{') || error.message.includes('{'))) {
        try {
          const match = error.message.match(/{.+}/);
          if (match) {
            const errorJson = JSON.parse(match[0]);
            if (errorJson.message) {
              errorMessage = errorJson.message;
            }
          }
        } catch (e) {
          console.warn('Failed to parse error JSON:', e);
        }
      }
      
      // Handle Failed to fetch errors specifically
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = `Network error when calling ${functionName}. Please check your connection and try again.`;
      }
      
      // Handle timeout errors
      if (errorMessage.includes('timed out')) {
        errorMessage = `Operation timed out. The server is taking too long to respond. Please try again later.`;
      }
      
      // Use the generic error handler if showToast is true
      if (showToast) {
        handleError({...error, message: errorMessage});
      }
      
      // This ensures the caller gets a rejected promise
      throw {...error, message: errorMessage};
    }
  },
  
  /**
   * Call admin API endpoints (for SFD admins and super admins)
   */
  async callAdminApi(endpoint: string, method: string = 'GET', payload: any = null, options: CallOptions = {}) {
    const adminPayload = {
      endpoint,
      method,
      data: payload
    };
    
    return this.callEdgeFunction('admin-api-gateway', adminPayload, {
      ...options,
      requireAuth: true, // Always require auth for admin endpoints
      maxRetries: 3,     // Default to 3 retries for admin endpoints
      timeout: 45000     // Longer timeout for admin operations
    });
  },
  
  /**
   * Synchronize SFD accounts data with the MEREF backend
   */
  async synchronizeSfdAccounts(userId: string, sfdId?: string) {
    return this.callEdgeFunction('synchronize-sfd-accounts', {
      userId,
      sfdId,
      forceSync: true
    }, {
      timeout: 60000, // 1 minute timeout for synchronization
      maxRetries: 2   // Limit retries for sync operations
    });
  },
  
  /**
   * Get MEREF stats for super admin
   */
  async getMerefStats() {
    return this.callAdminApi('/stats/dashboard', 'GET', null, {
      maxRetries: 2, // Limit retries for stats
      timeout: 20000 // 20 seconds timeout for stats
    });
  },
  
  /**
   * Get SFD stats for SFD admin
   */
  async getSfdStats(sfdId: string) {
    return this.callAdminApi(`/sfds/${sfdId}/stats`, 'GET', null, {
      maxRetries: 2, // Limit retries for stats
      timeout: 20000 // 20 seconds timeout for stats
    });
  }
};
