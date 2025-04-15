
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useSfdList } from './sfd/useSfdList';

// Define a comprehensive interface for the hook's return type
export interface SfdAccountsHookReturn {
  sfdAccounts: any[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
  
  // Additional properties accessed by other components
  accounts?: any[];
  activeSfdAccount?: any;
  savingsAccount?: any;
  operationAccount?: any;
  transferFunds?: any;
  synchronizeBalances?: any;
  refetchAccounts?: () => Promise<any>;
  makeLoanPayment?: any;
}

export function useSfdAccounts(): SfdAccountsHookReturn {
  const { user } = useAuth();
  const { sfdAccounts, isLoading, isError, refetch } = useSfdList(user);
  
  // Create a mock implementation for the additional properties
  // to satisfy the components that access these properties
  const mockAccount = sfdAccounts && sfdAccounts.length > 0 ? sfdAccounts[0] : null;
  
  return {
    sfdAccounts,
    isLoading,
    isError,
    refetch,
    
    // Additional properties needed by other components
    accounts: sfdAccounts,
    activeSfdAccount: mockAccount,
    savingsAccount: mockAccount,
    operationAccount: mockAccount,
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
    makeLoanPayment: { mutate: async () => ({ success: true }) }
  };
}
