
import { Transaction } from '@/types/transactions';
import { BaseTransactionManager } from './managers/baseTransactionManager';
import { DepositManager } from './managers/depositManager';
import { WithdrawalManager } from './managers/withdrawalManager';
import { LoanManager } from './managers/loanManager';
import { TransactionParams } from './interfaces/transactionInterfaces';

/**
 * Combined transaction manager that provides access to all transaction operations
 */
export class TransactionManager {
  private baseManager: BaseTransactionManager;
  private depositManager: DepositManager;
  private withdrawalManager: WithdrawalManager;
  private loanManager: LoanManager;
  private userId: string;
  private sfdId: string;

  constructor(userId: string, sfdId: string) {
    this.userId = userId;
    this.sfdId = sfdId;
    this.baseManager = new BaseTransactionManager(userId, sfdId);
    this.depositManager = new DepositManager(userId, sfdId);
    this.withdrawalManager = new WithdrawalManager(userId, sfdId);
    this.loanManager = new LoanManager(userId, sfdId);
  }

  /**
   * Creates a new transaction
   */
  async createTransaction(params: TransactionParams): Promise<Transaction | null> {
    return this.baseManager.createTransaction(params);
  }

  /**
   * Makes a deposit
   */
  async makeDeposit(amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    return this.depositManager.makeDeposit(amount, description, paymentMethod);
  }

  /**
   * Makes a withdrawal
   */
  async makeWithdrawal(amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    return this.withdrawalManager.makeWithdrawal(amount, description, paymentMethod);
  }

  /**
   * Makes a loan repayment
   */
  async makeLoanRepayment(loanId: string, amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    return this.loanManager.makeLoanRepayment(loanId, amount, description, paymentMethod);
  }

  /**
   * Gets transaction history
   */
  async getTransactionHistory(limit: number = 10): Promise<Transaction[]> {
    return this.baseManager.getTransactionHistory(limit);
  }

  /**
   * Gets account balance
   */
  async getAccountBalance(): Promise<number> {
    return this.baseManager.getAccountBalance();
  }
}

/**
 * Factory function to create a TransactionManager
 */
export const createTransactionManager = (userId: string, sfdId: string): TransactionManager => {
  return new TransactionManager(userId, sfdId);
};

// Export the TransactionParams interface to maintain the public API
export { TransactionParams } from './interfaces/transactionInterfaces';
