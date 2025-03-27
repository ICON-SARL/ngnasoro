
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { UseTransactionsFetchProps } from '@/types/realtimeTransactions';
import { convertDatabaseRecordsToTransactions, generateMockTransactions } from '@/utils/transactionUtils';

// Define a minimal interface for the query result to avoid deep inference
interface SupabaseQueryResult {
  data: any[] | null;
  error: any | null;
}

export function useTransactionsFetch({ activeSfdId, userId, toast }: UseTransactionsFetchProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchTransactions = useCallback(async () => {
    if (!userId || !activeSfdId) {
      return { transactions: [], error: null };
    }
    
    setIsLoading(true);
    
    try {
      // Use manual type casting to avoid excessive type inference
      const response = await supabase
        .from('transactions')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      // Explicitly cast the response to our simple interface
      const result = response as unknown as SupabaseQueryResult;
      const { data, error } = result;
      
      if (error) throw error;
      
      let txData: Transaction[] = [];
      
      if (data && data.length > 0) {
        // Type casting here to avoid deep inference
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
