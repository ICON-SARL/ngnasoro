
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '@/utils/api/modules/transactionApi';
import { useToast } from './use-toast';

export function useTransactionDisputes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);

  // Query disputes
  const {
    data: disputes,
    isLoading,
    error
  } = useQuery({
    queryKey: ['transaction-disputes'],
    queryFn: () => transactionApi.getTransactionHistory({ status: 'disputed' })
  });

  // Create dispute mutation
  const createDispute = useMutation({
    mutationFn: transactionApi.reportTransactionDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-disputes'] });
      toast({
        title: 'Litige créé',
        description: 'Le litige a été créé avec succès'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le litige: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Resolve dispute mutation
  const resolveDispute = useMutation({
    mutationFn: transactionApi.resolveTransactionDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-disputes'] });
      toast({
        title: 'Litige résolu',
        description: 'Le litige a été résolu avec succès'
      });
      setSelectedDispute(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de résoudre le litige: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  return {
    disputes,
    isLoading,
    error,
    selectedDispute,
    setSelectedDispute,
    createDispute,
    resolveDispute
  };
}
