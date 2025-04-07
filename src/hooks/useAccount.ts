
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Account {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  last_updated: string;
}

interface BalanceUpdate {
  amount: number;
}

export const useAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // Query to fetch account data
  const { data: account, isLoading, isError, refetch } = useQuery({
    queryKey: ['account', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching account:', error);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });

  // Mutation to update balance
  const updateBalance = useMutation({
    mutationFn: async ({ amount }: BalanceUpdate) => {
      if (!userId) throw new Error("User ID is required");

      // If amount is negative, create a withdrawal transaction
      // If amount is positive, create a deposit transaction
      const transactionType = amount < 0 ? 'withdrawal' : 'deposit';
      
      // Insert transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: Math.abs(amount),
          type: transactionType,
          name: amount < 0 ? 'Retrait' : 'Dépôt',
          description: amount < 0 ? 'Retrait depuis compte' : 'Dépôt sur compte',
          sfd_id: 'default-sfd'
        })
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      // The trigger will automatically update the account balance
      return transactionData;
    },
    onSuccess: () => {
      // Invalidate account and transactions queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['account', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    account,
    isLoading,
    isError,
    updateBalance,
    refetch,
  };
};
