
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactions/transactionService';
import { TransactionFilters } from '@/services/transactions/types';
import { Transaction } from '@/types/transactions';

/**
 * Hook for querying transactions data
 */
export function useTransactionQuery(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  const transactionsQuery = useQuery({
    queryKey: ['transactions', userId, sfdId, filters],
    queryFn: () => transactionService.getUserTransactions(userId || '', sfdId || '', filters),
    enabled: !!userId && !!sfdId
  });

  const fetchTransactions = async (limit: number = 10): Promise<Transaction[]> => {
    try {
      return await transactionService.getUserTransactions(
        userId || '', 
        sfdId || '', 
        { ...filters, limit }
      );
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    refetch: transactionsQuery.refetch,
    fetchTransactions
  };
}
