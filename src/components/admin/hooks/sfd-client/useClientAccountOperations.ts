
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getClientBalance, creditClientAccount, deleteClientAccount } from './sfdClientAccountService';

export function useClientAccountOperations(clientId?: string) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, activeSfdId } = useAuth();

  // Récupérer le solde du client
  const balanceQuery = useQuery({
    queryKey: ['client-balance', clientId],
    queryFn: async () => {
      if (!clientId) return { balance: 0, currency: 'FCFA' };
      try {
        setError(null);
        return await getClientBalance(clientId);
      } catch (err: any) {
        setError(err.message || "Une erreur s'est produite lors de la récupération du solde");
        throw err;
      }
    },
    enabled: !!clientId
  });

  // Mutation pour créditer le compte client
  const creditAccount = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description?: string }) => {
      if (!clientId || !user?.id) {
        throw new Error("Identifiants client ou administrateur manquants");
      }
      try {
        setError(null);
        return await creditClientAccount({
          clientId,
          amount,
          adminId: user.id,
          description
        });
      } catch (err: any) {
        setError(err.message || "Une erreur s'est produite lors du crédit du compte");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-balance', clientId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
      toast({
        title: "Compte crédité",
        description: "Le compte du client a été crédité avec succès",
        variant: "default",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créditer le compte: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour supprimer le compte client
  const deleteAccount = useMutation({
    mutationFn: async () => {
      if (!clientId || !user?.id || !activeSfdId) {
        throw new Error("Identifiants manquants");
      }
      try {
        setError(null);
        return await deleteClientAccount({
          clientId,
          adminId: user.id,
          sfdId: activeSfdId
        });
      } catch (err: any) {
        setError(err.message || "Une erreur s'est produite lors de la suppression du compte");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
      toast({
        title: "Compte supprimé",
        description: "Le compte du client a été supprimé avec succès",
        variant: "default",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le compte: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    balance: balanceQuery.data?.balance || 0,
    currency: balanceQuery.data?.currency || 'FCFA',
    isLoading: balanceQuery.isLoading,
    error,
    creditAccount,
    deleteAccount,
    refetchBalance: balanceQuery.refetch
  };
}
