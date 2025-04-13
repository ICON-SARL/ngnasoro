
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '@/services/account/accountService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UpdateBalanceParams } from '@/services/account/types';

export function useAccountMutation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateBalance = useMutation({
    mutationFn: async ({ amount }: UpdateBalanceParams) => {
      if (!user) throw new Error('User not logged in');
      return accountService.updateAccountBalance(user.id, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le solde: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    updateBalance
  };
}
