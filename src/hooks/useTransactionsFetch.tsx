
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
      // Manually construct a fetch request to avoid TypeScript issues
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/transactions?sfd_id=eq.${activeSfdId}&order=created_at.desc&limit=50`, 
        {
          headers: {
            'apikey': supabase.supabaseKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      
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
