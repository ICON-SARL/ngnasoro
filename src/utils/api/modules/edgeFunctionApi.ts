
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errorHandler";
import { toast } from "@/hooks/use-toast";

/**
 * Edge function caller methods
 */
export const edgeFunctionApi = {
  /**
   * Call a Supabase Edge Function with improved error handling
   */
  async callEdgeFunction(functionName: string, payload: any, options = { showToast: true }) {
    try {
      console.log(`Calling edge function: ${functionName}`, payload);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: JSON.stringify(payload),
      });
      
      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        
        if (options.showToast) {
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
      
      // Handle network errors differently
      if (error instanceof Error && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('NetworkError') ||
           error.message.includes('Failed to send a request'))) {
        
        if (options.showToast) {
          toast({
            title: "Erreur de connexion",
            description: "Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.",
            variant: "destructive"
          });
        }
        
        // Return mock data for development purposes if needed
        // This is useful during development when edge functions are not available
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Returning mock data for ${functionName} in development mode`);
          return getMockDataForFunction(functionName, payload);
        }
      }
      
      handleError(error);
      throw error;
    }
  }
};

/**
 * Get mock data for a function during development
 * This is useful when edge functions are not available
 */
function getMockDataForFunction(functionName: string, payload: any) {
  switch (functionName) {
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
    
    // Add more function mocks as needed
    
    default:
      console.warn(`No mock data available for ${functionName}`);
      return null;
  }
}
