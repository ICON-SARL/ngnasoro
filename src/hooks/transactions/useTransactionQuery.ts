
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

export const useTransactionQuery = (userId?: string, sfdId?: string) => {
  const { data: transactions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', userId, sfdId],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });

  const fetchTransactions = async (limit?: number) => {
    if (!userId) return { transactions: [] };

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (sfdId) {
      query = query.eq('sfd_id', sfdId);
    }
    
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
      return { transactions: [] };
    }

    return { transactions: data || [] };
  };

  return {
    transactions,
    isLoading,
    isError,
    refetch,
    fetchTransactions
  };
};
