
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SfdAccount, SfdAccountType } from '@/types/sfdAccounts';
import { normalizeSfdAccounts } from '@/utils/accountAdapters';

// Define a simplified interface for fetched accounts to avoid deep type recursion
interface FetchedAccount {
  id: string;
  user_id: string;
  sfd_id: string;
  balance: number;
  currency: string;
  updated_at?: string;
  last_updated?: string;
  account_type?: SfdAccountType;
  name?: string | null;
  description?: string | null;
  logo_url?: string | null;
  status?: string;
  code?: string;
  is_default?: boolean;
  region?: string;
}

// The hook function that gets and manages SFD accounts
export function useSfdAccounts(sfdId?: string) {
  const { user, activeSfdId } = useAuth();
  const effectiveSfdId = sfdId || activeSfdId;

  // Fetch SFD accounts
  const { 
    data: fetchedAccounts = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['sfdAccounts', user?.id, effectiveSfdId],
    queryFn: async (): Promise<FetchedAccount[]> => {
      if (!user?.id) return [] as FetchedAccount[];
      
      try {
        console.log('Fetching accounts for user', user.id, 'and SFD', effectiveSfdId);
        
        // Query the accounts table instead of sfd_accounts
        let query = supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);
          
        if (effectiveSfdId) {
          query = query.eq('sfd_id', effectiveSfdId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching accounts:', error);
          return [] as FetchedAccount[];
        }
        
        console.log('Fetched accounts from DB:', data);
        
        // If no accounts found, return mock data for testing
        if (!data || data.length === 0) {
          console.log('No accounts found, returning mock data');
          return [
            {
              id: 'test-account-1',
              user_id: user.id,
              sfd_id: effectiveSfdId || 'test-sfd-1',
              account_type: 'operation',
              description: 'Compte courant',
              name: 'Compte courant',
              balance: 150000,
              currency: 'FCFA',
              status: 'active',
              last_updated: new Date().toISOString()
            },
            {
              id: 'test-account-2',
              user_id: user.id,
              sfd_id: effectiveSfdId || 'test-sfd-1',
              account_type: 'epargne',
              description: 'Compte épargne',
              name: 'Compte épargne',
              balance: 250000,
              currency: 'FCFA',
              status: 'active',
              last_updated: new Date().toISOString()
            }
          ] as FetchedAccount[];
        }
        
        // Get SFD info to enhance the accounts with type information
        const { data: sfdInfo } = await supabase
          .from('sfds')
          .select('id, name, code, region, logo_url')
          .eq('id', effectiveSfdId)
          .maybeSingle();
        
        // Ensure all data has the required properties by explicitly mapping and providing defaults
        return data.map((account): FetchedAccount => {
          // Create a properly typed object with all necessary fields and defaults
          return {
            id: account.id,
            user_id: account.user_id,
            sfd_id: account.sfd_id,
            balance: account.balance || 0,
            currency: account.currency || 'FCFA',
            last_updated: account.last_updated || new Date().toISOString(),
            updated_at: account.updated_at || new Date().toISOString(),
            
            // Add properties that might be missing with defaults
            account_type: (account.account_type as SfdAccountType) || 'operation',
            description: account.description || 'Compte principal',
            name: account.name || (sfdInfo?.name ? `Compte ${sfdInfo.name}` : 'Compte SFD'),
            logo_url: sfdInfo?.logo_url || null,
            status: account.status || 'active',
            code: sfdInfo?.code,
            region: sfdInfo?.region,
            is_default: !!account.is_default
          };
        });
      } catch (err) {
        console.error('Error in accounts query:', err);
        return [] as FetchedAccount[];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Convert fetched accounts to SfdAccount type
  // Force TypeScript to treat the result as a plain array instead of allowing it to infer a complex type
  const rawAccounts = Array.isArray(fetchedAccounts) ? fetchedAccounts : [];
  
  // Explicitly map to SfdAccount with defined properties to prevent deep type instantiation
  const sfdAccounts: SfdAccount[] = rawAccounts.map((account): SfdAccount => ({
    id: account.id,
    sfd_id: account.sfd_id,
    account_type: account.account_type as SfdAccountType || 'operation',
    description: account.description || null,
    name: account.name || null,
    balance: account.balance,
    currency: account.currency,
    status: account.status || 'active',
    created_at: account.last_updated || new Date().toISOString(),
    updated_at: account.last_updated || new Date().toISOString(),
    logo_url: account.logo_url || null,
    code: account.code,
    is_default: account.is_default,
    isDefault: account.is_default,
    region: account.region
  }));

  // Mutation to synchronize balances - Updated to match React Query's mutation pattern
  const synchronizeBalances = useMutation({
    mutationFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        console.log('Synchronizing balances for user', user.id, 'and SFD', effectiveSfdId);
        
        // Call the synchronize-sfd-accounts edge function
        const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
          body: {
            userId: user.id,
            sfdId: effectiveSfdId,
            forceFullSync: true
          }
        });
        
        if (error) {
          console.error('Error synchronizing accounts:', error);
          throw error;
        }
        
        console.log('Synchronization response:', data);
        
        // Refetch accounts after synchronization
        await refetch();
        
        return { 
          success: true, 
          message: 'Balances synchronized successfully',
          data 
        };
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

  // For backward compatibility purposes:
  const accounts = sfdAccounts;  // Alias sfdAccounts to accounts
  
  // Get operation, savings, and repayment accounts
  const operationAccount = sfdAccounts.find(account => account.account_type === 'operation');
  const savingsAccount = sfdAccounts.find(account => account.account_type === 'epargne');
  const repaymentAccount = sfdAccounts.find(account => account.account_type === 'remboursement');
  
  // Create activeSfdAccount
  const activeSfdAccount = sfdAccounts.length > 0 ? {
    id: sfdAccounts[0].id,
    name: sfdAccounts[0].name || sfdAccounts[0].description || 'SFD Account',
    description: sfdAccounts[0].description || '',
    logoUrl: sfdAccounts[0].logo_url,
    logo_url: sfdAccounts[0].logo_url,
    code: sfdAccounts[0].code || '',
    region: sfdAccounts[0].region || '',
    balance: sfdAccounts.reduce((total, account) => total + (account.balance || 0), 0),
    currency: sfdAccounts[0].currency || 'FCFA',
    isDefault: sfdAccounts[0].isDefault || sfdAccounts[0].is_default || false,
    is_default: sfdAccounts[0].isDefault || sfdAccounts[0].is_default || false,
    isVerified: true,
    status: sfdAccounts[0].status || 'active',
    sfd_id: sfdAccounts[0].sfd_id,
    account_type: sfdAccounts[0].account_type || '',
    created_at: sfdAccounts[0].created_at,
    updated_at: sfdAccounts[0].updated_at,
    loans: [] // Default empty loans array
  } : null;

  // Create a mock implementation of transferFunds - updated to match React Query's mutation pattern
  const transferFunds = useMutation({
    mutationFn: async (params: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Transferring funds with params:', params);
      
      return {
        success: true,
        message: 'Funds transferred successfully'
      };
    }
  });
  
  // Create a mock implementation of makeLoanPayment - updated to match React Query's mutation pattern
  const makeLoanPayment = useMutation({
    mutationFn: async (params: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Making loan payment with params:', params);
      
      return {
        success: true,
        message: 'Loan payment made successfully'
      };
    }
  });
  
  return {
    // Original properties
    sfdAccounts,
    isLoading,
    error,
    refetch,
    synchronizeBalances,
    
    // Additional properties needed by components
    accounts,
    activeSfdAccount,
    operationAccount,
    savingsAccount,
    repaymentAccount,
    transferFunds,
    makeLoanPayment,
    refetchAccounts: refetch,
    refetchSavingsAccount: refetch
  };
}

export default useSfdAccounts;
