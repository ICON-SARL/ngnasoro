
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useSfdList } from './sfd/useSfdList';

export function useSfdAccounts() {
  const { user } = useAuth();
  const { 
    sfdAccounts,
    isLoading, 
    isError, 
    refetch 
  } = useSfdList(user);

  return {
    sfdAccounts,
    isLoading,
    isError,
    refetch,
    accounts: sfdAccounts,
    activeSfdAccount: sfdAccounts?.[0] || null,
    savingsAccount: null,
    operationAccount: null,
    transferFunds: { mutate: async () => ({ success: true }) },
    synchronizeBalances: { 
      mutate: async (_, options) => {
        await refetch();
        if (options?.onSettled) options.onSettled();
        return { success: true };
      }
    },
    refetchAccounts: refetch,
    makeLoanPayment: { mutate: async () => ({ success: true }) }
  };
}
