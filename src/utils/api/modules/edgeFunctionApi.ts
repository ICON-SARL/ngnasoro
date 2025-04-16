
import { supabase } from '@/integrations/supabase/client';

/**
 * Utilitaire pour appeler les fonctions edge Supabase
 */
export const edgeFunctionApi = {
  /**
   * Appelle une fonction edge Supabase
   * @param functionName Nom de la fonction edge
   * @param payload Données à envoyer à la fonction
   * @returns Réponse de la fonction
   */
  callFunction: async <T = any>(functionName: string, payload: any): Promise<{ data: T | null; error: Error | null; success?: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });
      
      if (error) throw error;
      
      // Standardize response format to include success and message properties
      // that might be expected by consumers
      return { 
        data, 
        error: null,
        success: data?.success !== undefined ? data.success : true,
        message: data?.message || null
      };
    } catch (error: any) {
      console.error(`Erreur lors de l'appel à la fonction ${functionName}:`, error);
      return { 
        data: null, 
        error,
        success: false,
        message: error.message || "Une erreur s'est produite"
      };
    }
  },
  
  // Alias for backward compatibility (some functions call this instead)
  callEdgeFunction: async <T = any>(functionName: string, payload: any, options?: { showToast?: boolean; timeout?: number }) => {
    return edgeFunctionApi.callFunction<T>(functionName, payload);
  }
};
