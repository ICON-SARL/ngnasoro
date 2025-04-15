
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Transaction } from '@/types/transactions';
import { ensureValidTransactionType, convertDatabaseRecordsToTransactions } from '@/utils/transactionUtils';

export function useTransactions(userId?: string | null, sfdId?: string | null) {
  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['transactions', userId, sfdId],
    queryFn: async (): Promise<Transaction[]> => {
      if (!userId) return [];

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sfdId && sfdId !== 'default-sfd') {
        query = query.eq('sfd_id', sfdId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      // Use the utility function to convert database records to Transaction objects
      const convertedTransactions = convertDatabaseRecordsToTransactions(data);
      
      return convertedTransactions.map(tx => ({
        ...tx,
        name: tx.name || (tx.type === 'deposit' ? 'Dépôt' : 'Retrait'),
        date: tx.date || tx.created_at,
      }));
    },
    enabled: !!userId,
  });

  const fetchTransactions = useCallback(() => {
    return refetch();
  }, [refetch]);

  // Mock function for getBalance until we implement real balance calculation
  const getBalance = async (): Promise<number> => {
    if (!userId) return 0;
    
    const { data, error } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
    
    return data?.balance || 0;
  };

  return {
    transactions,
    isLoading,
    fetchTransactions,
    getBalance
  };
}
