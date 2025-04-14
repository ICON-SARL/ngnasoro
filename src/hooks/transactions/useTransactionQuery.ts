
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactions/transactionService';
import { TransactionFilters } from '@/services/transactions/types';
import { Transaction } from '@/types/transactions';
import { useState } from 'react';

/**
 * Hook for querying transactions data
 */
export function useTransactionQuery(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  const [isRefetching, setIsRefetching] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ['transactions', userId, sfdId, filters],
    queryFn: () => transactionService.getUserTransactions(userId || '', sfdId || '', filters),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const fetchTransactions = async (): Promise<{ transactions: Transaction[] }> => {
    try {
      setIsRefetching(true);
      const transactions = await transactionService.getUserTransactions(
        userId || '', 
        sfdId || '', 
        { ...filters, limit: 10 }
      );
      setIsRefetching(false);
      return { transactions };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setIsRefetching(false);
      return { transactions: [] };
    }
  };

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading || isRefetching,
    isError: transactionsQuery.isError,
    refetch: transactionsQuery.refetch,
    fetchTransactions
  };
}
