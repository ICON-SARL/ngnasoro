
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errorHandler";
import { apiClient } from "@/utils/apiClient";

export interface DashboardData {
  profile?: any;
  account?: any;
  sfdAccounts?: any[];
  transactions?: any[];
  financialSummary?: {
    income: number;
    expenses: number;
    savings: number;
    sfdCount: number;
  };
  nearestLoan?: any;
}

export const dashboardApi = {
  /**
   * Get dashboard data for a user
   */
  async getDashboardData(userId: string, period: string = 'month'): Promise<DashboardData> {
    try {
      // Try to call the edge function first
      const { data: functionData, error: functionError } = await supabase.functions.invoke('mobile-dashboard', {
        body: JSON.stringify({ userId, period }),
      });
      
      if (!functionError && functionData && functionData.success) {
        return functionData.data;
      }
      
      console.error('Error from edge function:', functionError);
      
      // Fall back to direct database queries if the edge function fails
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      const { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      const { data: userSfds } = await supabase
        .from('user_sfds')
        .select(`
          id,
          is_default,
          sfds:sfd_id(id, name, code, region, logo_url)
        `)
        .eq('user_id', userId);
        
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);
        
      // Calculate financial summary from transactions
      let income = 0;
      let expenses = 0;
      
      transactions?.forEach(tx => {
        if (tx.amount > 0) {
          income += Number(tx.amount);
        } else {
          expenses += Math.abs(Number(tx.amount));
        }
      });
      
      return {
        profile: profile || {},
        account: account || { balance: 0, currency: 'FCFA' },
        sfdAccounts: userSfds || [],
        transactions: transactions || [],
        financialSummary: {
          income,
          expenses,
          savings: income - expenses,
          sfdCount: userSfds?.length || 0
        },
        nearestLoan: null
      };
    } catch (error) {
      handleError(error);
      return {
        profile: {},
        account: { balance: 0, currency: 'FCFA' },
        sfdAccounts: [],
        transactions: [],
        financialSummary: {
          income: 0,
          expenses: 0,
          savings: 0,
          sfdCount: 0
        },
        nearestLoan: null
      };
    }
  },
  
  /**
   * Refresh dashboard data for a user
   */
  async refreshDashboardData(userId: string): Promise<boolean> {
    try {
      // In a real implementation, this might trigger some backend process
      // For now, let's just return true to indicate success
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }
};
