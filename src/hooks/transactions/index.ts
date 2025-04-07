
import { useTransactionQuery } from './useTransactionQuery';
import { useTransactionMutation } from './useTransactionMutation';
import { useTransactionOperations } from './useTransactionOperations';
import { TransactionFilters } from '@/services/transactions/types';

/**
 * Combined hook for transaction management
 */
export function useTransactions(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  const query = useTransactionQuery(userId, sfdId);
  const { createTransaction } = useTransactionMutation();
  const operations = useTransactionOperations(userId, sfdId);

  return {
    // From useTransactionQuery
    transactions: query.transactions,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    fetchTransactions: query.fetchTransactions,
    
    // From useTransactionMutation
    createTransaction,
    
    // From useTransactionOperations
    getBalance: operations.getBalance,
    makeDeposit: operations.makeDeposit.mutateAsync,
    makeWithdrawal: operations.makeWithdrawal.mutateAsync,
    makeLoanRepayment: operations.makeLoanRepayment.mutateAsync
  };
}

// Re-export for backward compatibility
export * from './useTransactionQuery';
export * from './useTransactionMutation';
export * from './useTransactionOperations';
