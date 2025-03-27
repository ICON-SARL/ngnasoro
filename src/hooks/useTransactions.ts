
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactions/transactionService';
import { CreateTransactionOptions, TransactionFilters } from '@/services/transactions/types';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transactions';

export function useTransactions(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', userId, sfdId, filters],
    queryFn: () => transactionService.getUserTransactions(userId || '', sfdId || '', filters),
    enabled: !!userId && !!sfdId
  });

  const createTransaction = useMutation({
    mutationFn: (options: CreateTransactionOptions) => 
      transactionService.createTransaction(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction créée',
        description: 'La transaction a été créée avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création de la transaction',
        variant: 'destructive',
      });
    }
  });

  // Ajout des fonctions manquantes
  const fetchTransactions = async (limit: number = 10) => {
    try {
      const data = await transactionService.getUserTransactions(userId || '', sfdId || '', { ...filters, limit });
      queryClient.setQueryData(['transactions', userId, sfdId, filters], data);
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  const getBalance = async () => {
    try {
      if (!userId || !sfdId) return 0;
      const balance = await transactionService.getAccountBalance(userId, sfdId);
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  };

  const makeDeposit = async (amount: number, description?: string, paymentMethod?: string) => {
    try {
      if (!userId || !sfdId) return null;
      
      const result = await createTransaction.mutateAsync({
        userId,
        sfdId,
        amount,
        type: 'deposit',
        name: description || 'Dépôt',
        description: description || 'Dépôt de fonds',
        paymentMethod: paymentMethod || 'sfd_account'
      });
      
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      return result;
    } catch (error) {
      console.error('Error making deposit:', error);
      return null;
    }
  };

  const makeWithdrawal = async (amount: number, description?: string, paymentMethod?: string) => {
    try {
      if (!userId || !sfdId) return null;
      
      const result = await createTransaction.mutateAsync({
        userId,
        sfdId,
        amount: -Math.abs(amount), // Ensure negative amount for withdrawals
        type: 'withdrawal',
        name: description || 'Retrait',
        description: description || 'Retrait de fonds',
        paymentMethod: paymentMethod || 'sfd_account'
      });
      
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      return result;
    } catch (error) {
      console.error('Error making withdrawal:', error);
      return null;
    }
  };

  const makeLoanRepayment = async (loanId: string, amount: number, description?: string, paymentMethod?: string) => {
    try {
      if (!userId || !sfdId) return null;
      
      const result = await createTransaction.mutateAsync({
        userId,
        sfdId,
        amount: -Math.abs(amount), // Ensure negative amount for repayments
        type: 'loan_repayment',
        name: description || 'Remboursement de prêt',
        description: description || `Remboursement pour le prêt ${loanId}`,
        paymentMethod: paymentMethod || 'sfd_account',
        referenceId: loanId
      });
      
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      return result;
    } catch (error) {
      console.error('Error making loan repayment:', error);
      return null;
    }
  };

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    createTransaction,
    refetch: transactionsQuery.refetch,
    fetchTransactions,
    getBalance,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment
  };
}
