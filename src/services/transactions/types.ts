
import { Transaction } from '@/types/transactions';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_disbursement' | 'other';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'flagged';

export interface CreateTransactionOptions {
  userId: string;
  sfdId?: string;
  name: string;
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  description?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  referenceId?: string;
}

export interface TransactionFilters {
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface TransactionStatistics {
  totalVolume: number;
  transactionCount: number;
  averageAmount: number;
  depositVolume: number;
  withdrawalVolume: number;
}
