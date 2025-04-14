
import { Transaction } from './transactions';

export interface UseTransactionsFilterProps {
  transactions: Transaction[];
}

export interface UseTransactionsStatsProps {
  transactions: Transaction[];
}

export interface UseTransactionsFetchProps {
  activeSfdId?: string;
  userId?: string;
  toast: any;
}

export interface UseRealtimeSubscriptionProps {
  activeSfdId?: string;
  onUpdate: (payload: any) => void;
}
