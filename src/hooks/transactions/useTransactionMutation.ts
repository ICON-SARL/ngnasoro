
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { PaymentMethod } from '@/services/transactions/types';

type CreateTransactionParams = {
  user_id: string;
  sfdId: string;
  name: string;
  type: string;
  amount: number;
  description?: string;
  paymentMethod?: PaymentMethod;
  referenceId?: string;
};

export function useTransactionMutation() {
  const createTransaction = useMutation({
    mutationFn: async (params: CreateTransactionParams): Promise<Transaction> => {
      const { 
        user_id, 
        sfdId, 
        name, 
        type, 
        amount, 
        description, 
        paymentMethod, 
        referenceId 
      } = params;

      const transactionData = {
        user_id,
        sfd_id: sfdId,
        name,
        type,
        amount,
        description: description || `Transaction ${type}`,
        payment_method: paymentMethod || 'sfd_account',
        reference_id: referenceId || `tx-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'success'
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }

      return data as Transaction;
    }
  });

  return { createTransaction };
}
