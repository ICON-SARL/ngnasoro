
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan_payment' | 'loan_disbursement' | string;
  amount: number;
  date: string;
  name?: string;
  description?: string;
  status?: string;
  avatar_url?: string;
  created_at?: string;
  user_id?: string;
  sfd_id?: string;
}

export function useTransactions(userId?: string, sfdId?: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const {
    data,
    isLoading,
    refetch: fetchTransactionsQuery
  } = useQuery({
    queryKey: ['transactions', userId, sfdId],
    queryFn: async () => {
      try {
        if (!userId) {
          console.log('No user ID provided, returning mock data');
          return generateMockTransactions();
        }
        
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId);
          
        if (sfdId) {
          query = query.eq('sfd_id', sfdId);
        }
        
        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) {
          console.error('Error fetching transactions:', error);
          return generateMockTransactions(); // Fallback to mock data on error
        }
        
        return data || [];
      } catch (err) {
        console.error('Error in transactions query:', err);
        return generateMockTransactions();
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    if (data) {
      setTransactions(data);
    }
  }, [data]);

  const fetchTransactions = useCallback(async () => {
    return fetchTransactionsQuery();
  }, [fetchTransactionsQuery]);

  const getBalance = useCallback(async (): Promise<number> => {
    try {
      if (!userId) return 0;
      
      const { data } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)
        .single();
        
      return data?.balance || 0;
    } catch (err) {
      console.error('Error getting balance:', err);
      return 0;
    }
  }, [userId]);

  function generateMockTransactions(): Transaction[] {
    const types = ['deposit', 'withdrawal', 'transfer', 'loan_payment', 'loan_disbursement'];
    const names = [
      'Dépôt en espèces', 
      'Retrait', 
      'Transfert vers épargne',
      'Paiement de prêt', 
      'Décaissement'
    ];
    
    return Array(10).fill(null).map((_, i) => {
      const typeIndex = Math.floor(Math.random() * types.length);
      return {
        id: `mock-${i}`,
        type: types[typeIndex],
        name: names[typeIndex],
        amount: Math.floor(Math.random() * 1000000) + 5000,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      };
    });
  }

  return {
    transactions,
    isLoading,
    fetchTransactions,
    getBalance,
    refetch: fetchTransactionsQuery // Add this to match the expected API
  };
}

export default useTransactions;
