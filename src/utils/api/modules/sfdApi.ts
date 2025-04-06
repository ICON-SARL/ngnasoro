
import { supabase } from "@/integrations/supabase/client";
import { SfdBalanceData } from "@/hooks/sfd/types";

// Define the SfdBalanceResult interface here to avoid circular dependencies
export interface SfdBalanceResult {
  balance: number;
  currency: string;
}

export const sfdApi = {
  // Get the list of available SFDs
  getSfdsList: async () => {
    const { data, error } = await supabase
      .from('sfds')
      .select('*')
      .eq('status', 'active');
      
    if (error) {
      console.error('Error fetching SFDs:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Get SFDs associated with a user
  getUserSfds: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          id,
          is_default,
          sfds:sfd_id(id, name, code, region, logo_url)
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user SFDs:', error);
      throw error;
    }
  },
  
  // Check client status with a particular SFD
  getSfdClientStatus: async (userId: string, sfdId: string) => {
    const { data, error } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking client status:', error);
      throw error;
    }
    
    return data || null;
  },
  
  // Get balance for a specific SFD
  getSfdBalance: async (userId: string, sfdId: string): Promise<SfdBalanceResult> => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance, currency')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching balance:', error);
        // Return a default balance if there's an error
        return { balance: 0, currency: 'FCFA' };
      }
      
      return {
        balance: data?.balance || 0,
        currency: data?.currency || 'FCFA'
      };
    } catch (error) {
      console.error('Error in getSfdBalance:', error);
      return { balance: 0, currency: 'FCFA' };
    }
  },
  
  // Get loans associated with a SFD
  getSfdLoans: async (userId: string, sfdId: string) => {
    const { data, error } = await supabase
      .from('sfd_loans')
      .select(`
        id, 
        amount, 
        duration_months, 
        interest_rate,
        monthly_payment, 
        next_payment_date,
        last_payment_date, 
        status,
        created_at
      `)
      .eq('sfd_id', sfdId)
      .eq('client_id', userId);
      
    if (error) {
      console.error('Error fetching SFD loans:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Get MEREF dashboard stats
  getMerefDashboardStats: async () => {
    // This would normally be a real API call to the MEREF dashboard
    // For now, return mock data
    return {
      totalSfds: 45,
      activeSfds: 42,
      suspendedSfds: 3,
      totalSubsidies: 2500000000,
      activeSubsidies: 1750000000,
      pendingRequests: 12
    };
  }
};
