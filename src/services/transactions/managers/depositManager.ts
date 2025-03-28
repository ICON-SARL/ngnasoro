
import { Transaction } from '@/types/transactions';
import { BaseTransactionManager } from './baseTransactionManager';

/**
 * Manager for deposit transactions
 */
export class DepositManager extends BaseTransactionManager {
  /**
   * Processes a deposit transaction
   */
  async makeDeposit(amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }

    return this.createTransaction({
      amount: amount,
      type: 'deposit',
      description: description || 'Deposit to SFD account',
      paymentMethod,
      name: 'Deposit'
    });
  }
}
