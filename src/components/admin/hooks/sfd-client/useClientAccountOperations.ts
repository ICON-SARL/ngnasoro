
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { creditClientAccount } from './sfdClientAccountService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useClientAccountOperations(clientId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch client account balance
  const { data: accountData, refetch: refetchBalance } = useQuery({
    queryKey: ['client-account-balance', clientId],
    queryFn: async () => {
      // A simplified query - in a real app this would fetch from an API or Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('accounts')
        .select('balance, currency')
        .eq('user_id', clientId)
        .maybeSingle();
        
      if (error) throw error;
      return {
        balance: data?.balance || 0,
        currency: data?.currency || 'FCFA'
      };
    }
  });
  
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
      queryClient.invalidateQueries({ queryKey: ['client-account-balance', clientId] });
      
      // Manually refetch the balance
      refetchBalance();
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
    isLoading,
    // Expose balance and currency data
    balance: accountData?.balance || 0,
    currency: accountData?.currency || 'FCFA',
    refetchBalance
  };
}
