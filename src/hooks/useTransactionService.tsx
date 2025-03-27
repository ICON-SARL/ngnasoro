
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  transactionService, 
  TransactionType, 
  TransactionStatus, 
  TransactionFilters 
} from '@/services/transactionService';
import { Transaction } from '@/types/transactions';

interface CreateTransactionParams {
  amount: number;
  name: string;
  type: TransactionType;
  sfdId?: string;
  status?: TransactionStatus;
  description?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  referenceId?: string;
}

export function useTransactionService() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = useCallback(async (params: CreateTransactionParams) => {
    if (!user) {
      setError('User must be logged in to create transactions');
      toast({
        title: 'Error',
        description: 'You must be logged in to create transactions',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await transactionService.createTransaction({
        userId: user.id,
        sfdId: params.sfdId || activeSfdId,
        name: params.name,
        amount: params.amount,
        type: params.type,
        status: params.status,
        description: params.description,
        paymentMethod: params.paymentMethod,
        metadata: params.metadata,
        referenceId: params.referenceId
      });

      if (transaction) {
        toast({
          title: 'Transaction Created',
          description: `${params.type.charAt(0).toUpperCase() + params.type.slice(1)} transaction successful`,
        });
      } else {
        setError('Failed to create transaction');
        toast({
          title: 'Transaction Failed',
          description: 'Unable to create transaction. Please try again.',
          variant: 'destructive',
        });
      }
      
      return transaction;
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the transaction');
      toast({
        title: 'Transaction Error',
        description: err.message || 'An error occurred while creating the transaction',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, activeSfdId, toast]);

  const getUserTransactions = useCallback(async (filters?: TransactionFilters) => {
    if (!user) {
      setError('User must be logged in to fetch transactions');
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const transactions = await transactionService.getUserTransactions(user.id, activeSfdId, filters);
      return transactions;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching transactions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, activeSfdId]);

  const getTransactionStats = useCallback(async (period: 'day' | 'week' | 'month' = 'month') => {
    if (!user) {
      setError('User must be logged in to fetch transaction statistics');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const stats = await transactionService.generateTransactionStatistics(
        user.id,
        activeSfdId,
        period
      );
      return stats;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching transaction statistics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, activeSfdId]);

  return {
    createTransaction,
    getUserTransactions,
    getTransactionStats,
    isLoading,
    error
  };
}
