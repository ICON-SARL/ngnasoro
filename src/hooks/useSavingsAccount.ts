
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTransactions, Transaction } from './transactions';

export interface SavingsAccount {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  last_updated: string;
}

export function useSavingsAccount(userId?: string) {
  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const { transactions, isLoading: isTransactionsLoading, refetch: refetchTransactions } = useTransactions(userId);
  
  const {
    isLoading: isAccountLoading,
    error,
    data,
    refetch: refetchAccount
  } = useQuery({
    queryKey: ['account', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching account:', error);
        throw error;
      }
      
      return data as SavingsAccount | null;
    },
    enabled: !!userId
  });
  
  useEffect(() => {
    if (data) {
      setAccount(data);
    }
  }, [data]);
  
  const refetch = async () => {
    await Promise.all([
      refetchAccount(),
      refetchTransactions()
    ]);
  };
  
  return {
    account,
    transactions,
    isLoading: isAccountLoading || isTransactionsLoading,
    error,
    refetch
  };
}
