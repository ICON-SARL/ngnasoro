
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditClientAccount } from './sfdClientAccountService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useClientAccountOperations(clientId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const creditAccount = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return creditClientAccount({
        clientId,
        amount,
        adminId: user.id,
        description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'opération',
        variant: 'destructive',
      });
    }
  });

  return {
    creditAccount,
    isLoading
  };
}
