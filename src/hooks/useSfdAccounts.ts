
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SfdAccount, SfdAccountType } from '@/types/sfdAccounts';
import { normalizeSfdAccounts } from '@/utils/accountAdapters';

// Define a simplified interface for fetched accounts to avoid deep type recursion
interface FetchedSfdAccount {
  id: string;
  user_id?: string;
  sfd_id: string;
  account_type: SfdAccountType;
  description?: string | null;
  name?: string | null;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  logo_url?: string | null;
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
        
        // If no accounts found, return mock data for testing
        if (!data || data.length === 0) {
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
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              logo_url: null
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
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              logo_url: null
            }
          ] as FetchedSfdAccount[];
        }
        
        // Enhance accounts with description and name if missing
        return data.map((account: any): FetchedSfdAccount => ({
          ...account,
          description: account.description || `Compte ${account.account_type || ''}`,
          name: account.name || `Compte ${account.account_type || ''}`,
          logo_url: account.logo_url || null
        }));
      } catch (err) {
        console.error('Error in SFD accounts query:', err);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Convert fetched accounts to SfdAccount type
  // Explicitly handle the array type to prevent deep instantiation
  const rawAccounts = Array.isArray(fetchedAccounts) ? fetchedAccounts : [];
  const sfdAccounts: SfdAccount[] = rawAccounts.map((account: FetchedSfdAccount): SfdAccount => ({
    id: account.id,
    sfd_id: account.sfd_id,
    account_type: account.account_type,
    description: account.description || null,
    name: account.name || null,
    balance: account.balance,
    currency: account.currency,
    status: account.status,
    created_at: account.created_at,
    updated_at: account.updated_at,
    logo_url: account.logo_url || null,
    code: account.code,
    is_default: account.is_default,
    isDefault: account.is_default,
    region: account.region
  }));

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

  // Create a mock implementation of transferFunds
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
  
  // Create a mock implementation of makeLoanPayment
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
