
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { PaymentMethod } from '@/services/transactions/types';

type DepositParams = {
  amount: number;
  description?: string;
  paymentMethod?: string;
};

type WithdrawalParams = {
  amount: number;
  description?: string;
  paymentMethod?: string;
};

type LoanRepaymentParams = {
  loanId: string;
  amount: number;
  description?: string;
  paymentMethod?: string;
};

/**
 * Hook for common transaction operations like deposit, withdrawal, etc.
 */
export function useTransactionOperations(userId?: string, sfdId?: string) {
  const queryClient = useQueryClient();

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

  const makeDeposit = useMutation({
    mutationFn: async (params: DepositParams | number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
      if (!userId || !sfdId) return null;
      
      // Handle both function signatures (object param or individual params)
      let amount: number;
      let desc: string | undefined;
      let method: string | undefined;
      
      if (typeof params === 'object') {
        amount = params.amount;
        desc = params.description;
        method = params.paymentMethod;
      } else {
        amount = params;
        desc = description;
        method = paymentMethod;
      }
      
      const transactionData = {
        user_id: userId,
        sfd_id: sfdId,
        amount: amount,
        type: 'deposit',
        name: desc || 'Dépôt',
        description: desc || 'Dépôt de fonds',
        payment_method: method || 'sfd_account',
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
    }
  });

  const makeWithdrawal = useMutation({
    mutationFn: async (params: WithdrawalParams | number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
      if (!userId || !sfdId) return null;
      
      // Handle both function signatures (object param or individual params)
      let amount: number;
      let desc: string | undefined;
      let method: string | undefined;
      
      if (typeof params === 'object') {
        amount = params.amount;
        desc = params.description;
        method = params.paymentMethod;
      } else {
        amount = params;
        desc = description;
        method = paymentMethod;
      }
      
      const transactionData = {
        user_id: userId,
        sfd_id: sfdId,
        amount: -Math.abs(amount), // Ensure negative amount for withdrawals
        type: 'withdrawal',
        name: desc || 'Retrait',
        description: desc || 'Retrait de fonds',
        payment_method: method || 'sfd_account',
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
    }
  });

  const makeLoanRepayment = useMutation({
    mutationFn: async (params: LoanRepaymentParams | string, amount?: number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
      if (!userId || !sfdId) return null;
      
      // Handle both function signatures (object param or individual params)
      let loanId: string;
      let amt: number;
      let desc: string | undefined;
      let method: string | undefined;
      
      if (typeof params === 'object') {
        loanId = params.loanId;
        amt = params.amount;
        desc = params.description;
        method = params.paymentMethod;
      } else {
        loanId = params;
        amt = amount || 0;
        desc = description;
        method = paymentMethod;
      }
      
      const transactionData = {
        user_id: userId,
        sfd_id: sfdId,
        amount: -Math.abs(amt), // Ensure negative amount for repayments
        type: 'loan_repayment',
        name: desc || 'Remboursement de prêt',
        description: desc || `Remboursement pour le prêt ${loanId}`,
        payment_method: method || 'sfd_account',
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
    }
  });

  return {
    getBalance,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment
  };
}
