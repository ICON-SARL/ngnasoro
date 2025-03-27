
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type PaymentMethod = 'sfd_account' | 'mobile_money' | 'card' | 'cash';

export interface TransactionFilters {
  type?: TransactionType | TransactionType[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  category?: string;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
}

export interface TransactionStatistics {
  totalVolume: number;
  transactionCount: number;
  averageAmount: number;
  depositVolume: number;
  withdrawalVolume: number;
}

export interface CreateTransactionOptions {
  userId: string;
  sfdId: string;
  name: string;
  amount: number;
  type: TransactionType;
  description?: string;
  paymentMethod: PaymentMethod;
  referenceId?: string;
  category?: string;
  status?: TransactionStatus;
}
