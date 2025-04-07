
export type TransactionType = 
  'deposit' | 
  'withdrawal' | 
  'transfer' | 
  'payment' | 
  'loan_disbursement' | 
  'loan_repayment' | 
  'other';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'flagged';

export type PaymentMethod = 
  'sfd_account' | 
  'mobile_money' | 
  'bank_transfer' | 
  'cash' | 
  'card' | 
  'other';

export interface TransactionFilters {
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  category?: string;
  paymentMethod?: PaymentMethod;
  limit?: number;
}

export interface CreateTransactionOptions {
  userId: string;
  sfdId?: string;
  name: string;
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  description?: string;
  paymentMethod?: PaymentMethod;
  referenceId?: string;
  category?: string;
}
