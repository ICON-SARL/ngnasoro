
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
      // Cast to any to bypass TypeScript's complex type inference
      const result = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      const { data, error } = result;
      
      if (error) {
        throw error;
      }
      
      let txData: Transaction[] = [];
      
      if (data && data.length > 0) {
        // Convert the data to our Transaction type with proper type casting
        txData = data.map((item: any) => ({
          ...item,
          // Ensure type is one of the allowed values in Transaction type
          type: (item.type || 'other') as Transaction['type'],
          // Ensure status is one of the allowed values in Transaction['status']
          status: (item.status || 'success') as 'success' | 'pending' | 'failed' | 'flagged',
          sfd_id: activeSfdId
        })) as Transaction[];
      } else {
        // Generate mock data with proper typing
        const mockTx = generateMockTransactions(activeSfdId);
        txData = mockTx.map(tx => ({
          ...tx,
          type: (tx.type || 'other') as Transaction['type'],
          status: (tx.status || 'success') as 'success' | 'pending' | 'failed' | 'flagged'
        })) as Transaction[];
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
