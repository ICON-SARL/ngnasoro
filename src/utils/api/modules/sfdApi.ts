
import { supabase } from '@/integrations/supabase/client';
import { SfdBalanceData } from '@/hooks/sfd/types';

// SFD API client module
export const sfdApi = {
  /**
   * Get the balance for a specific SFD account
   */
  getSfdBalance: async (userId: string, sfdId: string): Promise<SfdBalanceData> => {
    try {
      // In a real implementation, you would call your backend API
      const { data, error } = await supabase.functions.invoke('get-sfd-balance', {
        body: { 
          userId,
          sfdId
        }
      });
      
      if (error) {
        console.error('Error fetching SFD balance:', error);
        return { balance: 0, currency: 'FCFA' };
      }
      
      return {
        balance: data?.balance || 0,
        currency: data?.currency || 'FCFA'
      };
    } catch (error) {
      console.error('SFD balance fetch error:', error);
      return { balance: 0, currency: 'FCFA' };
    }
  },
  
  /**
   * Synchronize SFD accounts
   */
  synchronizeAccounts: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: { 
          userId,
          forceSync: true
        }
      });
      
      if (error) {
        console.error('Error synchronizing SFD accounts:', error);
        return false;
      }
      
      return data?.success || false;
    } catch (error) {
      console.error('SFD synchronization error:', error);
      return false;
    }
  }
};
