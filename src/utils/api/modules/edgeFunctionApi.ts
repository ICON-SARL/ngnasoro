
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errorHandler";

/**
 * Edge function caller methods
 */
export const edgeFunctionApi = {
  /**
   * Call a Supabase Edge Function
   */
  async callEdgeFunction(functionName: string, payload: any) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: JSON.stringify(payload),
      });
      
      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(`Error in callEdgeFunction for ${functionName}:`, error);
      handleError(error);
      throw error;
    }
  }
};
