
import { useTransactionQuery } from './useTransactionQuery';
import { useTransactionMutation } from './useTransactionMutation';
import { useTransactionOperations } from './useTransactionOperations';
import { TransactionFilters } from '@/services/transactions/types';
import { useCallback, useEffect } from 'react';

/**
 * Combined hook for transaction management
 */
export function useTransactions(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  const query = useTransactionQuery(userId, sfdId, filters);
  const { createTransaction } = useTransactionMutation();
  const operations = useTransactionOperations(userId, sfdId);

  const refreshData = useCallback(async () => {
    try {
      await query.refetch();
      return true;
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      return false;
    }
  }, [query]);

  // Load initial data when component mounts
  useEffect(() => {
    if (userId && (sfdId || sfdId === 'default-sfd')) {
      refreshData();
    }
  }, [userId, sfdId, refreshData]);

  return {
    // From useTransactionQuery
    transactions: query.transactions,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: refreshData,
    fetchTransactions: query.fetchTransactions,
    
    // From useTransactionMutation
    createTransaction,
    
    // From useTransactionOperations
    getBalance: operations.getBalance,
    makeDeposit: operations.makeDeposit,
    makeWithdrawal: operations.makeWithdrawal,
    makeLoanRepayment: operations.makeLoanRepayment
  };
}

// Re-export for backward compatibility
export * from './useTransactionQuery';
export * from './useTransactionMutation';
export * from './useTransactionOperations';
