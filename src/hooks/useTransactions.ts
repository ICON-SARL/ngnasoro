
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Transaction } from '@/types/transactions';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

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

      // Convert database records to Transaction objects
      const convertedTransactions = data.map((record: any) => ({
        id: record.id,
        name: record.name || (record.type === 'deposit' ? 'Dépôt' : 'Retrait'),
        type: record.type,
        amount: record.amount,
        date: record.date || record.created_at,
        status: record.status || 'success',
        description: record.description,
        reference: record.reference || record.reference_id,
        reference_id: record.reference_id || record.reference,
        created_at: record.created_at,
        user_id: record.user_id,
        sfd_id: record.sfd_id || sfdId,
        avatar_url: record.avatar_url
      }));
      
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
