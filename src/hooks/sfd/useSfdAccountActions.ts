
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../auth/types';
import { synchronizeAccounts, processLoanPayment } from './sfdAccountsApi';
import { useToast } from '@/hooks/use-toast';
import { LoanPaymentParams } from './types';

export function useSfdAccountActions(user: User | null, activeSfdId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Synchronize account balances from SFD
  const synchronizeBalances = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      
      return synchronizeAccounts(user.id);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user-sfds'] });
      queryClient.invalidateQueries({ queryKey: ['active-sfd'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      
      toast({
        title: 'Synchronisation réussie',
        description: 'Vos soldes ont été mis à jour avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de synchronisation',
        description: error.message || 'Une erreur est survenue lors de la synchronisation',
        variant: 'destructive',
      });
    }
  });
  
  // Make a payment on a loan
  const makeLoanPayment = useMutation({
    mutationFn: async (params: LoanPaymentParams) => {
      if (!user?.id || !activeSfdId) {
        throw new Error('User or active SFD not set');
      }
      
      return processLoanPayment(user.id, activeSfdId, params);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['active-sfd'] });
      queryClient.invalidateQueries({ queryKey: ['user-sfds'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      
      toast({
        title: 'Paiement effectué',
        description: 'Votre paiement a été traité avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de paiement',
        description: error.message || 'Une erreur est survenue lors du paiement',
        variant: 'destructive',
      });
    }
  });
  
  return {
    synchronizeBalances,
    makeLoanPayment
  };
}
