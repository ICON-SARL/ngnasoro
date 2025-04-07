
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

export const useTransactions = (userId: string, sfdId: string) => {
  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', userId, sfdId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });

  // Create a new transaction
  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'date'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: transaction.user_id,
          sfd_id: transaction.sfd_id,
          amount: transaction.amount,
          type: transaction.type,
          name: transaction.name,
          payment_method: transaction.payment_method,
          description: transaction.description,
          status: transaction.status || 'success'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId, sfdId] });
    },
  });

  // Function to fetch transactions with a limit
  const fetchTransactions = async (limit?: number) => {
    if (!userId) return { transactions: [] };

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (sfdId) {
      query = query.eq('sfd_id', sfdId);
    }
    
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
      return { transactions: [] };
    }

    return { transactions: data || [] };
  };

  // Get account balance
  const getBalance = async (): Promise<number> => {
    try {
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
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  };

  // Make deposit
  const makeDeposit = async (amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
    if (!userId || !sfdId) return null;
    
    const transactionData = {
      user_id: userId,
      sfd_id: sfdId,
      amount: amount,
      type: 'deposit',
      name: description || 'Dépôt',
      description: description || 'Dépôt de fonds',
      payment_method: paymentMethod || 'sfd_account',
      reference_id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'success'
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('Error making deposit:', error);
      return null;
    }

    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    await queryClient.invalidateQueries({ queryKey: ['account-balance'] });
    
    return data as Transaction;
  };

  // Make withdrawal
  const makeWithdrawal = async (amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
    if (!userId || !sfdId) return null;
    
    const transactionData = {
      user_id: userId,
      sfd_id: sfdId,
      amount: -Math.abs(amount), // Ensure negative amount for withdrawals
      type: 'withdrawal',
      name: description || 'Retrait',
      description: description || 'Retrait de fonds',
      payment_method: paymentMethod || 'sfd_account',
      reference_id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'success'
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('Error making withdrawal:', error);
      return null;
    }

    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    await queryClient.invalidateQueries({ queryKey: ['account-balance'] });
    
    return data as Transaction;
  };

  // Make loan repayment
  const makeLoanRepayment = async (loanId: string, amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
    if (!userId || !sfdId) return null;
    
    const transactionData = {
      user_id: userId,
      sfd_id: sfdId,
      amount: -Math.abs(amount), // Ensure negative amount for repayments
      type: 'loan_repayment',
      name: description || 'Remboursement de prêt',
      description: description || `Remboursement pour le prêt ${loanId}`,
      payment_method: paymentMethod || 'sfd_account',
      reference_id: loanId,
      date: new Date().toISOString(),
      status: 'success'
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('Error making loan repayment:', error);
      return null;
    }

    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    await queryClient.invalidateQueries({ queryKey: ['loans'] });
    
    return data as Transaction;
  };

  return {
    transactions,
    isLoading,
    isError,
    createTransaction,
    refetch,
    fetchTransactions,
    getBalance,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment
  };
};
