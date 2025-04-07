
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  user_id: string;
  sfd_id: string;
  amount: number;
  type: string;
  name: string;
  payment_method?: string;
  status?: string;
  description?: string;
  created_at?: string;
  date?: string;
}

export const useTransactions = (userId: string, sfdId: string) => {
  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactions, isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', userId, sfdId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });

  // Create a new transaction
  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'date'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: transaction.user_id,
          sfd_id: transaction.sfd_id,
          amount: transaction.amount,
          type: transaction.type,
          name: transaction.name,
          payment_method: transaction.payment_method,
          description: transaction.description,
          status: transaction.status || 'success'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId, sfdId] });
    },
  });

  return {
    transactions,
    isLoading,
    isError,
    createTransaction,
    refetch
  };
};
