
import { useAuth } from './useAuth';
import { useSfdList } from './sfd/useSfdList';
import { useActiveSfd } from './sfd/useActiveSfd';
import { useSfdAccountActions } from './sfd/useSfdAccountActions';
// Use export type for TypeScript types
export type { SfdAccount } from './sfd/types';

export function useSfdAccounts() {
  const { user, activeSfdId } = useAuth();
  
  // Get list of user's SFDs
  const { sfdAccounts, isLoading: isListLoading, isError: isListError, refetch: refetchList } = useSfdList(user);
  
  // Get active SFD details
  const { 
    activeSfdAccount, 
    isLoading: isActiveSfdLoading, 
    isError: isActiveSfdError, 
    refetch: refetchActive 
  } = useActiveSfd(user, activeSfdId);
  
  // Get SFD account actions (sync, payments)
  const { synchronizeBalances, makeLoanPayment } = useSfdAccountActions(user, activeSfdId);
  
  // Combined refetch function
  const refetch = () => {
    refetchList();
    refetchActive();
  };
  
  return {
    sfdAccounts,
    activeSfdAccount,
    isLoading: isListLoading || isActiveSfdLoading,
    isError: isListError || isActiveSfdError,
    makeLoanPayment,
    synchronizeBalances,
    refetch
  };
}
