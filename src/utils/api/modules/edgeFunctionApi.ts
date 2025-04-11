
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';

interface CallOptions {
  showToast?: boolean;
  requireAuth?: boolean;
  timeout?: number;
  maxRetries?: number;
}

export const edgeFunctionApi = {
  /**
   * Generic method to call Supabase Edge Functions with better error handling
   */
  async callEdgeFunction(functionName: string, payload: any = {}, options: CallOptions = {}) {
    const { 
      showToast = true, 
      requireAuth = true, 
      timeout = 30000,
      maxRetries = 3
    } = options;
    
    console.log(`Calling edge function: ${functionName}`, payload);
    
    try {
      // Set up a timeout promise to prevent hanging on API calls
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Edge function call to ${functionName} timed out after ${timeout/1000} seconds`)), timeout);
      });
      
      // Call the edge function with a retry mechanism
      const callWithRetry = async (retriesLeft = maxRetries, delay = 1000): Promise<any> => {
        try {
          // Log le début de la tentative
          console.log(`Tentative d'appel de ${functionName}, tentatives restantes: ${retriesLeft}`);
          
          const response = await supabase.functions.invoke(functionName, {
            body: payload,
          });
          
          // Vérifier le code de statut dans la réponse
          if (response.error) {
            console.error(`Error response from ${functionName}:`, response.error);
            
            // Si c'est une erreur de statut non-2xx, on la formate différemment
            if (response.error.message && response.error.message.includes('non-2xx status')) {
              throw new Error(`Edge Function returned a non-2xx status code. Details: ${response.error.message}`);
            }
            
            throw response.error;
          }
          
          console.log(`Appel réussi à ${functionName}`, response.data);
          return response.data;
        } catch (err: any) {
          console.error(`Error in attempt for ${functionName}, retries left: ${retriesLeft-1}`, err);
          
          if (retriesLeft <= 1) {
            console.error(`Max retries reached for ${functionName}`);
            throw err;
          }
          
          console.log(`Retry attempt for ${functionName}, retries left: ${retriesLeft-1}, waiting ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return callWithRetry(retriesLeft - 1, Math.min(delay * 2, 10000)); // Exponential backoff with 10s maximum
        }
      };
      
      // Race the function call against the timeout
      const data = await Promise.race([
        callWithRetry(maxRetries),
        timeoutPromise
      ]);
      
      return data;
    } catch (error: any) {
      console.error(`Error in callEdgeFunction for ${functionName}:`, error);
      
      // Format the error message to be more user-friendly
      let errorMessage = error.message || `Erreur lors de l'appel à ${functionName}`;
      
      // Tenter de parser un message d'erreur JSON si possible
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
