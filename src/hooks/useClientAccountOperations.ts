
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useClientAccountOperations(clientId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch client account balance
  const { data: accountData, refetch: refetchBalance } = useQuery({
    queryKey: ['client-account-balance', clientId],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching account balance:', error);
        return {
          balance: 0,
          currency: 'FCFA'
        };
      }
    }
  });
  
  const creditAccount = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      setIsLoading(true);
      
      try {
        // In a real implementation, this would call an API endpoint
        // For now, we'll simulate a credit operation
        const { data, error } = await supabase.rpc('credit_client_account', {
          p_client_id: clientId,
          p_amount: amount,
          p_admin_id: user.id,
          p_description: description || 'Credit operation'
        });
        
        if (error) throw error;
        return data;
      } finally {
        setIsLoading(false);
      }
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
