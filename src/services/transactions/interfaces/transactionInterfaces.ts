
/**
 * Parameters for creating a transaction
 */
export interface TransactionParams {
  amount: number;
  type: 'deposit' | 'withdrawal' | 'loan_repayment' | 'loan_disbursement';
  description?: string;
  paymentMethod?: string;
  referenceId?: string;
  name?: string;
}
