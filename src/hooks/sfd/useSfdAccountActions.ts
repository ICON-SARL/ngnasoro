
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../auth/types';
import { synchronizeSfdAccounts } from './syncAccounts';
import { processSfdLoanPayment } from './processPayments';
import { LoanPaymentParams } from './types';

export function useSfdAccountActions(user: User | null, sfdId: string | null) {
  const queryClient = useQueryClient();
  
  // Mutation for synchronizing balances
  const synchronizeBalances = useMutation({
    mutationFn: () => synchronizeSfdAccounts(user, sfdId),
    onSuccess: () => {
      // Invalidate and refetch relevant queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['sfd-balance', user?.id, sfdId] });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans', user?.id, sfdId] });
    }
  });
  
  // Mutation for making loan payments
  const makeLoanPayment = useMutation({
    mutationFn: (params: LoanPaymentParams) => 
      processSfdLoanPayment(user, sfdId, params),
    onSuccess: () => {
      // Invalidate and refetch relevant queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['sfd-balance', user?.id, sfdId] });
      queryClient.invalidateQueries({ queryKey: ['sfd-loans', user?.id, sfdId] });
    }
  });
  
  return {
    synchronizeBalances,
    makeLoanPayment
  };
}
