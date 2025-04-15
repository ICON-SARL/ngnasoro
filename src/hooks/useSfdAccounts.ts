
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useSfdList } from './sfd/useSfdList';
import { adaptSfdAccounts, adaptSfdAccount } from '@/utils/sfdAdapter';

export function useSfdAccounts() {
  const { user } = useAuth();
  const { 
    sfdAccounts: rawSfdAccounts,
    isLoading, 
    isError, 
    refetch 
  } = useSfdList(user);

  // Adapt the data to ensure consistency across the app
  const adaptedAccounts = adaptSfdAccounts(rawSfdAccounts || []);
  
  return {
    sfdAccounts: adaptedAccounts,
    isLoading,
    isError,
    refetch,
    accounts: adaptedAccounts,
    activeSfdAccount: adaptedAccounts?.[0] || null,
    savingsAccount: null,
    operationAccount: null,
    transferFunds: { mutate: async () => ({ success: true }) },
    synchronizeBalances: { 
      mutate: async (_, options) => {
        await refetch();
        if (options?.onSettled) options.onSettled();
        return { success: true };
      },
      isPending: false
    },
    refetchAccounts: refetch,
    makeLoanPayment: { 
      mutate: async () => ({ success: true }),
      isPending: false
    }
  };
}
