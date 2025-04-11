
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';

interface CallOptions {
  showToast?: boolean;
  requireAuth?: boolean;
  timeout?: number;
}

export const edgeFunctionApi = {
  /**
   * Generic method to call Supabase Edge Functions with better error handling
   */
  async callEdgeFunction(functionName: string, payload: any = {}, options: CallOptions = {}) {
    const { showToast = true, requireAuth = true, timeout = 30000 } = options;
    
    console.log(`Calling edge function: ${functionName}`, payload);
    
    try {
      // Set up a timeout promise to prevent hanging on API calls
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Edge function call to ${functionName} timed out`)), timeout);
      });
      
      // Call the edge function with a retry mechanism
      const callWithRetry = async (retries = 3, delay = 1000): Promise<any> => {
        try {
          const response = await supabase.functions.invoke(functionName, {
            body: payload,
          });
          
          if (response.error) throw response.error;
          return response;
        } catch (err) {
          if (retries <= 1) throw err;
          
          console.log(`Retry attempt for ${functionName}, retries left: ${retries-1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return callWithRetry(retries - 1, delay * 2);
        }
      };
      
      // Race the function call against the timeout
      const { data, error } = await Promise.race([
        callWithRetry(),
        timeoutPromise.then(() => {
          throw new Error(`Edge function call to ${functionName} timed out`);
        })
      ]) as any;
      
      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error in callEdgeFunction for ${functionName}:`, error);
      
      // Use the generic error handler if showToast is true
      if (showToast) {
        handleError(error);
      }
      
      // This ensures the caller gets a rejected promise
      throw error;
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
      requireAuth: true // Always require auth for admin endpoints
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
    });
  },
  
  /**
   * Get MEREF stats for super admin
   */
  async getMerefStats() {
    return this.callAdminApi('/stats/dashboard', 'GET');
  },
  
  /**
   * Get SFD stats for SFD admin
   */
  async getSfdStats(sfdId: string) {
    return this.callAdminApi(`/sfds/${sfdId}/stats`, 'GET');
  }
};
