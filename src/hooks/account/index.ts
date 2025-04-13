
import { useAccountQuery } from './useAccountQuery';
import { useAccountMutation } from './useAccountMutation';

export function useAccount() {
  const query = useAccountQuery();
  const { updateBalance } = useAccountMutation();
  
  return {
    account: query.account,
    isLoading: query.isLoading,
    isError: query.isError,
    updateBalance
  };
}

// Export for backward compatibility 
export * from './useAccountQuery';
export * from './useAccountMutation';
