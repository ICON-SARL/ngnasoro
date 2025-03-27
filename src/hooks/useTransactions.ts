
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactions/transactionService';
import { CreateTransactionOptions, TransactionFilters } from '@/services/transactions/types';
import { useToast } from '@/hooks/use-toast';

export function useTransactions(userId: string, sfdId: string, filters?: TransactionFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', userId, sfdId, filters],
    queryFn: () => transactionService.getUserTransactions(userId, sfdId, filters),
    enabled: !!userId && !!sfdId
  });

  const createTransaction = useMutation({
    mutationFn: (options: CreateTransactionOptions) => 
      transactionService.createTransaction(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction créée',
        description: 'La transaction a été créée avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création de la transaction',
        variant: 'destructive',
      });
    }
  });

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    createTransaction,
    refetch: transactionsQuery.refetch
  };
}
