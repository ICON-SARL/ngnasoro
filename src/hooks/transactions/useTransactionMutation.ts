
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactions/transactionService';
import { CreateTransactionOptions } from '@/services/transactions/types';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for transaction creation mutations
 */
export function useTransactionMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    createTransaction
  };
}
