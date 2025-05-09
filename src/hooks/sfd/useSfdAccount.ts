
import { useQuery, useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { fetchSfdLoans } from './fetchSfdLoans';
import { SfdClientAccount, SfdLoan } from './types';

interface SfdAccountResult {
  activeSfdAccount: SfdClientAccount | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useSfdAccount(user: any, activeSfdId: string | null): SfdAccountResult {
  // Return active SFD account details
  const activeAccountQuery = useQuery({
    queryKey: ['active-sfd', activeSfdId, user?.id],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return null;
      
      // Find the account in the cached accounts data
      const queryClient = useQueryClient();
      const cachedAccounts = queryClient.getQueryData<SfdClientAccount[]>(['user-sfds', user.id]);
      let activeSfdAccount = cachedAccounts?.find(acc => acc.id === activeSfdId);
      
      // Fetch loans for the active SFD
      try {
        const loans = await fetchSfdLoans(user.id, activeSfdId);
        
        // Add sample loan data for demo purposes if we have test accounts
        const enhancedLoans = loans.length > 0 ? loans : (
          user?.email?.includes('test') || activeSfdId.includes('test') ? [
            {
              id: 'loan-1',
              amount: 500000,
              remainingAmount: 300000,
              nextDueDate: '2023-05-15',
              isLate: true
            }
          ] : []
        );
        
        // If we didn't find the account in cache or we need to add loans, create or enhance it
        if (activeSfdAccount) {
          const accountWithLoans: SfdClientAccount = {
            ...activeSfdAccount,
            loans: enhancedLoans as SfdLoan[]
          };
          return accountWithLoans;
        } else if (user?.email?.includes('test')) {
          // For test accounts, create a sample account
          return {
            id: activeSfdId,
            name: 'Test SFD Account',
            logoUrl: null,
            logo_url: null,
            code: '',
            region: '',
            balance: 250000,
            currency: 'FCFA',
            isDefault: true,
            isVerified: true,
            status: 'active',
            loans: enhancedLoans as SfdLoan[],
            sfd_id: activeSfdId,
            account_type: 'main',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error fetching active SFD account:', error);
        return activeSfdAccount || null;
      }
    },
    enabled: !!user?.id && !!activeSfdId,
  });
  
  return {
    activeSfdAccount: activeAccountQuery.data || null,
    isLoading: activeAccountQuery.isLoading,
    isError: activeAccountQuery.isError,
    refetch: activeAccountQuery.refetch
  };
}
