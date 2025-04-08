
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errorHandler";
import { useToast } from "@/hooks/use-toast";

/**
 * Edge function caller methods
 */
export const edgeFunctionApi = {
  /**
   * Call a Supabase Edge Function with improved error handling
   */
  async callEdgeFunction(functionName: string, payload: any, options = { showToast: true, bypassCache: true }) {
    try {
      console.log(`Calling edge function: ${functionName}`, payload);
      
      // Check if we're in development mode and if we should use mock data
      if (process.env.NODE_ENV === 'development' && shouldUseMockData(functionName)) {
        console.log(`Using mock data for ${functionName} in development mode`);
        return getMockDataForFunction(functionName, payload);
      }

      // Add a random query parameter to bypass cache if needed
      const bypassCacheParam = options.bypassCache ? { 
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      } : {};
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        ...bypassCacheParam
      });
      
      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        
        if (options.showToast) {
          const { toast } = useToast();
          toast({
            title: "Erreur de connexion",
            description: "Impossible de contacter le serveur. Veuillez réessayer.",
            variant: "destructive"
          });
        }
        
        throw error;
      }
      
      console.log(`Edge function ${functionName} response:`, data);
      return data;
    } catch (error) {
      console.error(`Error in callEdgeFunction for ${functionName}:`, error);
      
      // Handle network errors
      if (error instanceof Error && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('NetworkError') ||
           error.message.includes('Failed to send') ||
           error.message.includes('network connection'))) {
        
        if (options.showToast) {
          const { toast } = useToast();
          toast({
            title: "Erreur de connexion",
            description: "Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.",
            variant: "destructive"
          });
        }
        
        // Return mock data for development purposes
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Returning mock data for ${functionName} in development mode`);
          const mockData = getMockDataForFunction(functionName, payload);
          if (mockData) {
            return mockData;
          }
        }
      }
      
      handleError(error);
      throw error;
    }
  }
};

/**
 * Determine if we should use mock data for a specific function
 * This allows developers to test specific features without edge functions
 */
function shouldUseMockData(functionName: string): boolean {
  // Add specific functions that should always use mock data in development
  const alwaysMockFunctions = [
    'fetch-sfd-stats',
    'create_sfd',
    'create_sfd_subsidy'
  ];
  
  return alwaysMockFunctions.includes(functionName);
}

/**
 * Get mock data for a function during development
 * This is useful when edge functions are not available
 */
function getMockDataForFunction(functionName: string, payload: any) {
  switch (functionName) {
    case 'fetch-sfd-stats':
      return {
        id: `mock-stats-${Date.now()}`,
        sfd_id: payload.sfd_id,
        total_clients: Math.floor(Math.random() * 100) + 10,
        total_loans: Math.floor(Math.random() * 50) + 5,
        repayment_rate: Math.random() * 100,
        last_updated: new Date().toISOString()
      };
      
    case 'create_sfd':
      return {
        id: 'mock-uuid-' + Date.now(),
        name: payload.sfd_data.name,
        code: payload.sfd_data.code,
        region: payload.sfd_data.region,
        status: payload.sfd_data.status,
        logo_url: payload.sfd_data.logo_url,
        contact_email: payload.sfd_data.contact_email,
        phone: payload.sfd_data.phone,
        legal_document_url: payload.sfd_data.legal_document_url,
        created_at: new Date().toISOString(),
      };
    
    case 'create_sfd_subsidy':
      return {
        id: 'mock-subsidy-' + Date.now(),
        sfd_id: payload.subsidy_data.sfd_id,
        amount: payload.subsidy_data.amount,
        remaining_amount: payload.subsidy_data.remaining_amount,
        allocated_by: payload.subsidy_data.allocated_by,
        status: payload.subsidy_data.status,
      };
    
    case 'create_sfd_admin':
      return {
        success: true,
        user_id: `mock-user-${Date.now()}`,
        message: "SFD admin created successfully"
      };
    
    default:
      console.warn(`No mock data available for ${functionName}`);
      return null;
  }
}
