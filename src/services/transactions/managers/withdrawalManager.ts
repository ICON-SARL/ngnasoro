
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { BaseTransactionManager } from './baseTransactionManager';

/**
 * Manager for withdrawal transactions
 */
export class WithdrawalManager extends BaseTransactionManager {
  /**
   * Processes a withdrawal transaction
   */
  async makeWithdrawal(amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    // Check if balance is sufficient
    const { data: account, error } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', this.userId)
      .single();

    if (error || !account) {
      throw new Error('Unable to verify account balance');
    }

    if (account.balance < amount) {
      throw new Error('Insufficient balance for this withdrawal');
    }

    return this.createTransaction({
      amount: amount,
      type: 'withdrawal',
      description: description || 'Withdrawal from SFD account',
      paymentMethod,
      name: 'Withdrawal'
    });
  }
}
