
import { supabase } from "@/integrations/supabase/client";

export interface DashboardData {
  profile: any;
  account: {
    balance: number;
    currency: string;
  };
  sfdAccounts: any[];
  transactions: any[];
  financialSummary: {
    income: number;
    expenses: number;
    savings: number;
    sfdCount: number;
  };
  nearestLoan: any | null;
}

export const dashboardApi = {
  async getDashboardData(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<DashboardData> {
    try {
      const { data, error } = await supabase.functions.invoke('mobile-dashboard', {
        body: JSON.stringify({ userId, period }),
      });
      
      if (error) throw error;
      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to fetch dashboard data');
      }
      
      return data.data as DashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return default structure with empty values
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
  
  async refreshDashboardData(userId: string): Promise<boolean> {
    try {
      // Call synchronize-sfd-accounts to update user balances
      await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: JSON.stringify({ userId }),
      });
      
      return true;
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      return false;
    }
  }
};
