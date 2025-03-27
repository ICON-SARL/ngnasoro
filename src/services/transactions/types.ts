
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_repayment' | 'loan_disbursement' | 'other';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type PaymentMethod = 'sfd_account' | 'mobile_money' | 'cash' | 'bank_transfer' | 'qr_code' | 'agency_qr' | 'other';

export interface TransactionFilters {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
  limit?: number;
  referenceId?: string;
}

export interface CreateTransactionOptions {
  userId: string;
  sfdId: string;
  name: string;
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  description?: string;
  paymentMethod?: PaymentMethod;
  referenceId?: string;
  category?: string;
}
