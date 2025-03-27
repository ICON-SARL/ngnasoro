
import { Transaction, TransactionStats } from '@/types/transactions';

export interface UseTransactionsFetchProps {
  activeSfdId?: string;
  userId?: string;
  toast: any;
}

export interface UseTransactionsFilterProps {
  transactions: Transaction[];
}

export interface UseTransactionsStatsProps {
  transactions: Transaction[];
}

export interface UseRealtimeSubscriptionProps {
  activeSfdId?: string;
  onUpdate: (payload: any) => void;
}
