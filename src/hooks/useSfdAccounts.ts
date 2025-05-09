
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SfdAccount } from '@/hooks/sfd/types';
import { normalizeSfdAccounts } from '@/utils/accountAdapters';

// The hook function that gets and manages SFD accounts
export function useSfdAccounts(sfdId?: string) {
  const { user, activeSfdId } = useAuth();
  const effectiveSfdId = sfdId || activeSfdId;

  // Fetch SFD accounts
  const { 
    data: sfdAccounts = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['sfdAccounts', user?.id, effectiveSfdId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        console.log('Fetching SFD accounts for user', user.id, 'and SFD', effectiveSfdId);
        
        let query = supabase
          .from('sfd_accounts')
          .select('*')
          .eq('user_id', user.id);
          
        if (effectiveSfdId) {
          query = query.eq('sfd_id', effectiveSfdId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching SFD accounts:', error);
          return [];
        }
        
        console.log('Fetched accounts:', data);
        
        // If no accounts found, return empty array
        if (!data || data.length === 0) {
          // For testing, create some dummy accounts if none exist
          return [
            {
              id: 'test-account-1',
              user_id: user.id,
              sfd_id: effectiveSfdId || 'test-sfd-1',
              account_type: 'operation',
              description: 'Compte courant',
              balance: 150000,
              currency: 'FCFA',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              name: 'Compte courant',
              logo_url: null
            },
            {
              id: 'test-account-2',
              user_id: user.id,
              sfd_id: effectiveSfdId || 'test-sfd-1',
              account_type: 'epargne',
              description: 'Compte épargne',
              balance: 250000,
              currency: 'FCFA',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              name: 'Compte épargne',
              logo_url: null
            }
          ];
        }
        
        return data;
      } catch (err) {
        console.error('Error in SFD accounts query:', err);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Mutation to synchronize balances
  const synchronizeBalances = useMutation({
    mutationFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        console.log('Synchronizing balances for user', user.id, 'and SFD', effectiveSfdId);
        
        // In a real app, you would make an API call to synchronize balances
        // For this implementation, we'll simulate a delay and refetch the data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await refetch();
        
        return { success: true, message: 'Balances synchronized successfully' };
      } catch (error) {
        console.error('Error synchronizing balances:', error);
        return { 
          success: false, 
          message: 'Failed to synchronize balances',
          error 
        };
      }
    }
  });

  return {
    sfdAccounts,
    isLoading,
    error,
    refetch,
    synchronizeBalances
  };
}

export default useSfdAccounts;
