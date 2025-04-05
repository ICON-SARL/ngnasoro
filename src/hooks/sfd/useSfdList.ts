
import { useQuery } from '@tanstack/react-query';
import { User } from '@/hooks/useAuth';
import { fetchUserSfds, fetchSfdBalance } from './sfdAccountsApi';
import { SfdAccount } from './types';

export function useSfdList(user: User | null) {
  const sfdsQuery = useQuery({
    queryKey: ['user-sfds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const sfdsList = await fetchUserSfds(user.id);
      
      if (sfdsList.length === 0) {
        console.log('User has no SFD accounts');
        return [];
      }
      
      // Transform the data format
      return Promise.all(sfdsList.map(async (sfd) => {
        try {
          const balanceData = await fetchSfdBalance(user.id, sfd.sfds.id);
          return {
            id: sfd.sfds.id,
            name: sfd.sfds.name,
            logoUrl: sfd.sfds.logo_url,
            region: sfd.sfds.region,
            code: sfd.sfds.code,
            isDefault: sfd.is_default,
            balance: balanceData.balance,
            currency: balanceData.currency
          };
        } catch (error) {
          console.error(`Failed to fetch balance for SFD ${sfd.sfds.name}:`, error);
          // Return account with zero balance in case of error
          return {
            id: sfd.sfds.id,
            name: sfd.sfds.name,
            logoUrl: sfd.sfds.logo_url,
            region: sfd.sfds.region,
            code: sfd.sfds.code,
            isDefault: sfd.is_default,
            balance: 0,
            currency: 'FCFA'
          };
        }
      }));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
  
  return {
    sfdAccounts: sfdsQuery.data || [],
    isLoading: sfdsQuery.isLoading,
    isError: sfdsQuery.isError,
    refetch: sfdsQuery.refetch
  };
}
