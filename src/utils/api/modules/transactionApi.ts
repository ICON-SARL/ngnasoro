
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errorHandler";

/**
 * Transaction management methods
 */
export const transactionApi = {
  /**
   * Get user's transaction history
   */
  async getUserTransactions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    }
  }
};
