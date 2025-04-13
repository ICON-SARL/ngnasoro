
import { useQuery } from '@tanstack/react-query';
import { accountService } from '@/services/account/accountService';
import { Account } from '@/services/account/types';
import { useAuth } from '@/hooks/useAuth';

export function useAccountQuery() {
  const { user } = useAuth();
  
  const accountQuery = useQuery({
    queryKey: ['account', user?.id],
    queryFn: async (): Promise<Account | null> => {
      if (!user) return null;
      return accountService.fetchUserAccount(user.id);
    },
    enabled: !!user,
  });
  
  return {
    account: accountQuery.data,
    isLoading: accountQuery.isLoading,
    isError: accountQuery.isError,
    refetch: accountQuery.refetch
  };
}
