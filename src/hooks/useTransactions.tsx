
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { createTransactionManager } from '@/services/transactions/transactionManager';
import { useTransactionsFetch } from './useTransactionsFetch';
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
  
  // Create a transaction manager instance
  const transactionManager = userId && sfdId ? createTransactionManager(userId, sfdId) : null;
  
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
    if (!transactionManager) {
      console.error('Transaction manager not initialized');
      return null;
    }
    
    try {
      const result = await transactionManager.createTransaction(data);
      await refetch();
      return result;
    } catch (err) {
      console.error('Error creating transaction:', err);
      return null;
    }
  }, [transactionManager, refetch]);
  
  // Make deposit function
  const makeDeposit = useCallback(async (amount: number, description?: string, paymentMethod?: string) => {
    if (!transactionManager) {
      console.error('Transaction manager not initialized');
      return null;
    }
    
    try {
      const result = await transactionManager.makeDeposit(amount, description, paymentMethod);
      await refetch();
      return result;
    } catch (err) {
      console.error('Error making deposit:', err);
      return null;
    }
  }, [transactionManager, refetch]);
  
  // Make withdrawal function
  const makeWithdrawal = useCallback(async (amount: number, description?: string, paymentMethod?: string) => {
    if (!transactionManager) {
      console.error('Transaction manager not initialized');
      return null;
    }
    
    try {
      const result = await transactionManager.makeWithdrawal(amount, description, paymentMethod);
      await refetch();
      return result;
    } catch (err) {
      console.error('Error making withdrawal:', err);
      return null;
    }
  }, [transactionManager, refetch]);
  
  // Make loan repayment function
  const makeLoanRepayment = useCallback(async (loanId: string, amount: number, description?: string, paymentMethod?: string) => {
    if (!transactionManager) {
      console.error('Transaction manager not initialized');
      return null;
    }
    
    try {
      const result = await transactionManager.makeLoanRepayment(loanId, amount, description, paymentMethod);
      await refetch();
      return result;
    } catch (err) {
      console.error('Error making loan repayment:', err);
      return null;
    }
  }, [transactionManager, refetch]);
  
  // Get balance function
  const getBalance = useCallback(async () => {
    if (!transactionManager) {
      console.error('Transaction manager not initialized');
      return 0;
    }
    
    try {
      return await transactionManager.getAccountBalance();
    } catch (err) {
      console.error('Error getting balance:', err);
      return 0;
    }
  }, [transactionManager]);
  
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
