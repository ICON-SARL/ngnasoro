
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { UseTransactionsFetchProps } from '@/types/realtimeTransactions';
import { convertDatabaseRecordsToTransactions, generateMockTransactions } from '@/utils/transactionUtils';

export function useTransactionsFetch({ activeSfdId, userId, toast }: UseTransactionsFetchProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchTransactions = useCallback(async () => {
    if (!userId || !activeSfdId) {
      return { transactions: [], error: null };
    }
    
    setIsLoading(true);
    
    try {
      // Avoid deep type inference by using type assertions after the query
      const result = await supabase
        .from('transactions')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      const data = result.data;
      const error = result.error;
      
      if (error) throw error;
      
      let txData: Transaction[] = [];
      
      if (data && data.length > 0) {
        // Convert the data to our Transaction type
        txData = convertDatabaseRecordsToTransactions(data, activeSfdId);
      } else {
        txData = generateMockTransactions(activeSfdId);
      }
      
      setIsLoading(false);
      return { transactions: txData, error: null };
    } catch (error) {
      console.error('Loading error:', error);
      toast({
        title: 'Loading Error',
        description: 'Unable to load transactions. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return { transactions: [], error };
    }
  }, [userId, activeSfdId, toast]);

  return {
    fetchTransactions,
    isLoading
  };
}
