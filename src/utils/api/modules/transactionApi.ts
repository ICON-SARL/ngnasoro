
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
      console.log("Fetching transactions for user:", userId);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} transactions`);
      
      // If no real transactions exist, create some sample ones
      if (!data || data.length === 0) {
        console.log("No transactions found, creating sample data");
        const sampleData = [
          {
            id: "sample-1",
            user_id: userId,
            type: "deposit",
            amount: 25000,
            name: "Dépôt mensuel",
            date: "2025-04-12T00:00:00Z",
            created_at: "2025-04-12T00:00:00Z",
            status: "success"
          },
          {
            id: "sample-2",
            user_id: userId,
            type: "loan_repayment",
            amount: -15000,
            name: "Remboursement prêt",
            date: "2025-04-10T00:00:00Z",
            created_at: "2025-04-10T00:00:00Z",
            status: "success"
          }
        ];
        
        // Insert sample data
        for (const tx of sampleData) {
          await supabase.from('transactions').insert(tx);
        }
        
        return sampleData;
      }
      
      return data;
    } catch (error) {
      handleError(error);
      return [];
    }
  }
};
