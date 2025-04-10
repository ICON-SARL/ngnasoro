
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Account {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

export function useAccount() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchAccount = async (): Promise<Account | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching account:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les informations de votre compte',
        variant: 'destructive',
      });
      return null;
    }
    
    return data;
  };
  
  const accountQuery = useQuery({
    queryKey: ['account', user?.id],
    queryFn: fetchAccount,
    enabled: !!user,
  });
  
  const updateBalance = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!user) throw new Error('User not logged in');
      
      // Get current balance first
      const { data: account, error: fetchError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Update with new balance
      const { data, error } = await supabase
        .from('accounts')
        .update({ balance: account.balance + amount })
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
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
    account: accountQuery.data,
    isLoading: accountQuery.isLoading,
    isError: accountQuery.isError,
    updateBalance,
  };
}
