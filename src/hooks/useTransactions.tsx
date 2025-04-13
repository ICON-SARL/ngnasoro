
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { createTransactionManager } from '@/services/transactions/transactionManager';
import { useTransactionsFetch } from './useTransactionsFetch';
import { useTransactionOperations } from './transactions/useTransactionOperations';
import { useToast } from './use-toast';

export function useTransactions(userId: string, sfdId: string) {
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { fetchTransactions, isLoading } = useTransactionsFetch({ 
    activeSfdId: sfdId, 
    userId, 
    toast 
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Get transaction operations from the dedicated hook
  const {
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment,
    getBalance
  } = useTransactionOperations(userId, sfdId);
  
  // Fetch transactions function
  const loadTransactions = useCallback(async () => {
    try {
      const result = await fetchTransactions();
      if (result.transactions) {
        setTransactions(result.transactions);
      }
      return result;
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
      return { transactions: [], error: err };
    }
  }, [fetchTransactions]);
  
  // Refetch transactions
  const refetch = useCallback(async () => {
    return await loadTransactions();
  }, [loadTransactions]);
  
  // Create transaction function
  const createTransaction = useCallback(async (data: any) => {
    try {
      // Create a transaction manager instance
      const transactionManager = userId && sfdId ? createTransactionManager(userId, sfdId) : null;
      
      if (!transactionManager) {
        console.error('Transaction manager not initialized');
        return null;
      }
      
      const result = await transactionManager.createTransaction(data);
      await refetch();
      return result;
    } catch (err) {
      console.error('Error creating transaction:', err);
      return null;
    }
  }, [userId, sfdId, refetch]);
  
  return {
    transactions,
    isLoading,
    error,
    fetchTransactions: loadTransactions,
    refetch,
    createTransaction,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment,
    getBalance
  };
}
