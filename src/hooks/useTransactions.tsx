
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Transaction {
  id: string;
  user_id: string;
  name: string;
  type: string;
  amount: number;
  date: string;
  avatar_url: string | null;
  created_at: string;
}

export function useTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer vos transactions',
        variant: 'destructive',
      });
      return [];
    }
    
    return data || [];
  };
  
  const transactionsQuery = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: fetchTransactions,
    enabled: !!user,
  });
  
  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not logged in');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            ...transaction,
          },
        ])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: 'Transaction réussie',
        description: 'Votre transaction a été enregistrée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'ajouter la transaction: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    addTransaction,
  };
}
