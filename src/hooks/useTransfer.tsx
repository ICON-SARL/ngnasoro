
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { transferService, TransferParams } from '@/services/transferService';
import { Transaction } from '@/types/transactions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useTransfer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [transferHistory, setTransferHistory] = useState<Transaction[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);

  // Mutation pour effectuer un transfert
  const transferMutation = useMutation({
    mutationFn: (params: TransferParams) => transferService.transferFunds(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transferHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recentContacts'] });
      
      toast({
        title: 'Transfert réussi',
        description: 'Votre transfert a été effectué avec succès',
      });
      
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur de transfert',
        description: error.message || 'Une erreur est survenue lors du transfert',
        variant: 'destructive',
      });
    }
  });

  // Requête pour récupérer l'historique des transferts
  const transferHistoryQuery = useQuery({
    queryKey: ['transferHistory', user?.id],
    queryFn: () => user?.id ? transferService.getTransferHistory(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Update transfer history when data changes
  if (transferHistoryQuery.data && transferHistoryQuery.data !== transferHistory) {
    setTransferHistory(transferHistoryQuery.data);
  }

  // Requête pour récupérer les contacts récents
  const recentContactsQuery = useQuery({
    queryKey: ['recentContacts', user?.id],
    queryFn: () => user?.id ? transferService.getRecentContacts(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Update recent contacts when data changes
  if (recentContactsQuery.data && recentContactsQuery.data !== recentContacts) {
    setRecentContacts(recentContactsQuery.data);
  }

  return {
    // État
    transferHistory,
    recentContacts,
    isLoadingHistory: transferHistoryQuery.isLoading,
    isLoadingContacts: recentContactsQuery.isLoading,
    
    // Mutations
    transferFunds: transferMutation,
    
    // Fonctions utilitaires
    refetchHistory: transferHistoryQuery.refetch,
    refetchContacts: recentContactsQuery.refetch
  };
}
