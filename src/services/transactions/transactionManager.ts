
import { Transaction } from '@/types/transactions';
import { DepositManager } from './managers/depositManager';
import { WithdrawalManager } from './managers/withdrawalManager';
import { LoanManager } from './managers/loanManager';
import { BaseTransactionManager } from './managers/baseTransactionManager';

/**
 * Parameters for creating a transaction
 */
export interface TransactionParams {
  amount: number;
  type: 'deposit' | 'withdrawal' | 'loan_repayment' | 'loan_disbursement' | 'transfer' | 'payment' | 'other';
  description?: string;
  paymentMethod?: string;
  referenceId?: string;
  name?: string;
}

/**
 * Transaction manager that combines all transaction managers into one
 */
export class TransactionManager extends BaseTransactionManager {
  private depositManager: DepositManager;
  private withdrawalManager: WithdrawalManager;
  private loanManager: LoanManager;

  constructor(userId: string, sfdId: string) {
    super(userId, sfdId);
    this.depositManager = new DepositManager(userId, sfdId);
    this.withdrawalManager = new WithdrawalManager(userId, sfdId);
    this.loanManager = new LoanManager(userId, sfdId);
  }

  /**
   * Makes a deposit transaction
   */
  async makeDeposit(amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    return this.depositManager.makeDeposit(amount, description, paymentMethod);
  }

  /**
   * Makes a withdrawal transaction
   */
  async makeWithdrawal(amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    return this.withdrawalManager.makeWithdrawal(amount, description, paymentMethod);
  }

  /**
   * Makes a loan repayment transaction
   */
  async makeLoanRepayment(loanId: string, amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    return this.loanManager.makeLoanRepayment(loanId, amount, description, paymentMethod);
  }
}

/**
 * Creates a transaction manager instance
 */
export function createTransactionManager(userId: string, sfdId: string): TransactionManager {
  return new TransactionManager(userId, sfdId);
}
