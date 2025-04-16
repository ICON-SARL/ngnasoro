
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
  callFunction: async <T = any>(functionName: string, payload: any): Promise<{ data: T | null; error: Error | null }> => {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de l'appel à la fonction ${functionName}:`, error);
      return { data: null, error };
    }
  }
};
