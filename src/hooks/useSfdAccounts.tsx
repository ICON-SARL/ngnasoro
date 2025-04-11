
import { useAuth } from './useAuth';
import { useSfdList } from './sfd/useSfdList';
import { useSfdAccount } from './sfd/useSfdAccount';
import { useSfdAccountActions } from './sfd/useSfdAccountActions';
import { User } from './auth/types';

// Export the SfdAccount type directly
import { SfdAccount } from './sfd/types';
export type { SfdAccount };

export function useSfdAccounts() {
  const { user, activeSfdId } = useAuth();
  
  // Get list of user's SFDs
  const { sfdAccounts, isLoading: isListLoading, isError: isListError, refetch: refetchList } = useSfdList(user);
  
  // Get active SFD details - guard against invalid activeSfdId values
  const validSfdId = activeSfdId && 
    activeSfdId !== 'default-sfd' && 
    activeSfdId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) ? 
    activeSfdId : null;
    
  const { 
    activeSfdAccount, 
    isLoading: isActiveSfdLoading, 
    isError: isActiveSfdError, 
    refetch: refetchActive 
  } = useSfdAccount(user, validSfdId);
  
  // Get SFD account actions (sync, payments)
  const { synchronizeBalances, makeLoanPayment } = useSfdAccountActions(user, validSfdId);
  
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
