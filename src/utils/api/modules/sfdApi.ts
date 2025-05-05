
import { supabase } from '@/integrations/supabase/client';
import { SfdData, SfdBalanceData, SfdLoan } from '@/hooks/sfd/types';

// Define the SfdBalanceResult interface
export interface SfdBalanceResult {
  balance: number;
  currency: string;
}

// SFD API client module
export const sfdApi = {
  /**
   * Get all SFDs
   */
  async getSfds(): Promise<SfdData[]> {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Transform the results to match SfdData type
      return data.map(sfd => ({
        id: sfd.id,
        name: sfd.name,
        code: sfd.code,
        region: sfd.region,
        status: sfd.status,
        logo_url: sfd.logo_url,
        description: sfd.description,
        settings: typeof sfd.settings === 'string' 
          ? JSON.parse(sfd.settings) 
          : sfd.settings
      }));
    } catch (error) {
      console.error('Error fetching SFDs:', error);
      return [];
    }
  },
  
  /**
   * For backward compatibility (aliased method)
   */
  async getSfdsList(): Promise<SfdData[]> {
    return this.getSfds();
  },
  
  /**
   * Get SFD balance for a user
   */
  async getSfdBalance(userId: string, sfdId: string): Promise<SfdBalanceData> {
    try {
      const { data, error } = await supabase.functions.invoke('get-sfd-balance', {
        body: { userId, sfdId }
      });
      
      if (error) throw error;
      
      return {
        balance: data?.balance || 0,
        currency: data?.currency || 'FCFA'
      };
    } catch (error) {
      console.error('Error fetching SFD balance:', error);
      return { balance: 0, currency: 'FCFA' };
    }
  },
  
  /**
   * Synchronize user accounts with SFD
   */
  async synchronizeAccounts(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: { userId }
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error synchronizing accounts:', error);
      return false;
    }
  },
  
  /**
   * Get list of all SFDs - alternative implementation
   */
  async getAllSfds(): Promise<SfdData[]> {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Transform the settings field to ensure it's treated as Record<string, any>
      return data.map((sfd: any) => ({
        ...sfd,
        settings: typeof sfd.settings === 'string' 
          ? JSON.parse(sfd.settings)
          : sfd.settings
      })) as SfdData[];
    } catch (error) {
      console.error('Error fetching SFDs:', error);
      return [];
    }
  },
  
  /**
   * Get SFD statistics
   */
  getSfdStats: async (sfdId: string) => {
    try {
      // First try to get stats from sfd_stats table
      const { data: statsData, error: statsError } = await supabase
        .from('sfd_stats')
        .select('*')
        .eq('sfd_id', sfdId)
        .single();
        
      if (!statsError && statsData) {
        return statsData;
      }
      
      // If no stats found, calculate them from clients and loans
      const { data: clientsData, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('count')
        .eq('sfd_id', sfdId);
        
      const { data: loansData, error: loansError } = await supabase
        .from('sfd_loans')
        .select('count')
        .eq('sfd_id', sfdId);
      
      return {
        client_count: clientsError ? 0 : (clientsData?.[0]?.count || 0),
        loan_count: loansError ? 0 : (loansData?.[0]?.count || 0),
      };
    } catch (error) {
      console.error('Error fetching SFD stats:', error);
      return { 
        client_count: 0, 
        loan_count: 0 
      };
    }
  },
  
  /**
   * Create a new SFD
   */
  createSfd: async (sfdData: any) => {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .insert([sfdData])
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating SFD:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing SFD
   */
  updateSfd: async (id: string, sfdData: any) => {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .update(sfdData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating SFD:', error);
      throw error;
    }
  },
  
  /**
   * Get SFDs associated with a user
   */
  getUserSfds: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          id,
          is_default,
          sfds (
            id,
            name,
            code,
            region,
            logo_url
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user SFDs:', error);
      return [];
    }
  },
  
  /**
   * Check SFD client status
   */
  getSfdClientStatus: async (userId: string, sfdId: string) => {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('status, kyc_level')
        .eq('user_id', userId)
        .eq('sfd_id', sfdId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching SFD client status:', error);
      return { status: 'unknown', kyc_level: 0 };
    }
  },
  
  /**
   * Get SFD loans for a client
   */
  getSfdLoans: async (userId: string, sfdId: string): Promise<SfdLoan[]> => {
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*')
        .eq('client_id', userId)
        .eq('sfd_id', sfdId);
      
      if (error) throw error;
      
      // Transform to SfdLoan format
      return (data || []).map(loan => {
        // Calculate the remaining amount - handle the case where paid_amount might not exist
        const paidAmount = loan.monthly_payment 
          ? (loan.duration_months - (loan.next_payment_date ? 1 : 0)) * loan.monthly_payment 
          : 0;
          
        return {
          id: loan.id,
          amount: loan.amount,
          remainingAmount: loan.amount - paidAmount,
          nextDueDate: loan.next_payment_date || new Date().toISOString(),
          isLate: new Date(loan.next_payment_date) < new Date()
        };
      });
    } catch (error) {
      console.error('Error fetching SFD loans:', error);
      return [];
    }
  },
  
  /**
   * Get MEREF dashboard stats
   */
  getMerefDashboardStats: async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-meref-dashboard-stats', {
        body: { userId }
      });
      
      if (error) throw error;
      
      return data || { requests: 0, approved: 0, pending: 0, rejected: 0, activeSfds: 0, pendingRequests: 0 };
    } catch (error) {
      console.error('Error fetching MEREF dashboard stats:', error);
      return { requests: 0, approved: 0, pending: 0, rejected: 0, activeSfds: 0, pendingRequests: 0 };
    }
  },
  
  /**
   * Create a new SFD with optional admin
   */
  createSfdWithAdmin: async (sfdData: any, adminData: any = null) => {
    try {
      console.log('Creating SFD with data:', sfdData);
      
      const { data, error } = await supabase.functions.invoke('create-sfd-with-admin', {
        body: JSON.stringify({ 
          sfdData,
          adminData
        })
      });
      
      if (error) {
        console.error('Error creating SFD with admin:', error);
        throw error;
      }
      
      if (data?.error) {
        console.error('Error returned from edge function:', data.error);
        throw new Error(data.error);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error in createSfdWithAdmin:', error);
      throw new Error(error.message || 'Failed to create SFD');
    }
  },
  
  /**
   * Create a subsidy for an SFD
   */
  createSfdSubsidy: async (subsidyData: any) => {
    try {
      const { data, error } = await supabase
        .from('sfd_subsidies')
        .insert(subsidyData)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating SFD subsidy:', error);
      throw error;
    }
  }
};
