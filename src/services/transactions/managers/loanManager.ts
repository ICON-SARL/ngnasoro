
import { Transaction } from '@/types/transactions';
import { BaseTransactionManager } from './baseTransactionManager';

/**
 * Manager for loan-related transactions
 */
export class LoanManager extends BaseTransactionManager {
  /**
   * Processes a loan repayment transaction
   */
  async makeLoanRepayment(loanId: string, amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    if (amount <= 0) {
      throw new Error('Repayment amount must be greater than 0');
    }

    return this.createTransaction({
      amount: amount,
      type: 'loan_repayment',
      description: description || `Loan repayment for ${loanId}`,
      paymentMethod,
      referenceId: loanId,
      name: 'Loan Repayment'
    });
  }
}
