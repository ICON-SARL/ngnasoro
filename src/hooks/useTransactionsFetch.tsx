
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
      // Break the chain to avoid deep type instantiation
      const query = supabase
        .from('transactions')
        .select('*');
      
      // Apply filters separately to avoid deep nesting of types
      const filteredQuery = query
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      // Use a simple type assertion to avoid TypeScript's complex type inference
      const result = await filteredQuery;
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
