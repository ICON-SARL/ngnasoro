
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

export function useTransactionQuery(userId?: string, sfdId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = useCallback(async (limit: number = 10): Promise<Transaction[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit || 10);

      if (error) {
        throw error;
      }

      return data as Transaction[];
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return [];
    }
  }, [userId]);

  const { isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', userId, sfdId],
    queryFn: async () => {
      const data = await fetchTransactions();
      setTransactions(data);
      return data;
    },
    enabled: !!userId,
  });

  return {
    transactions,
    isLoading,
    isError,
    refetch,
    fetchTransactions
  };
}
