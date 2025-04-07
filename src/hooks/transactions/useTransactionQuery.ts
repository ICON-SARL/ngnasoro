
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Transaction } from '@/types/transactions';
import { supabase } from '@/integrations/supabase/client';

export function useTransactionQuery(userId?: string, sfdId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const query = useQuery({
    queryKey: ['transactions', userId, sfdId],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }
      
      const { data, error } = await query.limit(20);
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      
      const formattedTransactions: Transaction[] = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        sfd_id: item.sfd_id,
        type: item.type,
        amount: item.amount,
        status: item.status || 'success',
        description: item.description || '',
        created_at: item.created_at || new Date().toISOString(),
        date: item.date || item.created_at,
        name: item.name || '',
        avatar_url: item.avatar_url
      }));
      
      setTransactions(formattedTransactions);
      return formattedTransactions;
    },
    enabled: !!userId
  });

  const fetchTransactions = async (limit: number = 20) => {
    if (!userId) return { transactions: [] };
    
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }
      
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return { transactions: [] };
      }
      
      const formattedTransactions: Transaction[] = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        sfd_id: item.sfd_id,
        type: item.type,
        amount: item.amount,
        status: item.status || 'success',
        description: item.description || '',
        created_at: item.created_at || new Date().toISOString(),
        date: item.date || item.created_at,
        name: item.name || '',
        avatar_url: item.avatar_url
      }));
      
      setTransactions(formattedTransactions);
      return { transactions: formattedTransactions };
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
      return { transactions: [] };
    }
  };

  return {
    transactions,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    fetchTransactions
  };
}
