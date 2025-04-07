
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transactions';
import { useTransactions as useTransactionsFromIndex } from './transactions'; // Import from the index file

// This is a wrapper around the new modular useTransactions hook
// to ensure compatibility with existing code
export function useTransactions(userId?: string, sfdId?: string) {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  
  // Use values from auth context if not provided
  const effectiveUserId = userId || user?.id;
  const effectiveSfdId = sfdId || activeSfdId || '';
  
  // Get the modern implementation
  const {
    transactions,
    isLoading,
    isError,
    refetch,
    fetchTransactions,
    createTransaction,
    getBalance,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment
  } = useTransactionsFromIndex(effectiveUserId, effectiveSfdId);
  
  return {
    transactions,
    isLoading,
    isError,
    refetch,
    fetchTransactions,
    createTransaction,
    getBalance,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment
  };
}
