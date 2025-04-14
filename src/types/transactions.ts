
export interface Transaction {
  id: number | string;
  name: string;
  type: 'deposit' | 'withdrawal';
  amount: string | number;
  date: string;
  status?: 'pending' | 'completed' | 'failed';
  description?: string;
  category?: string;
  reference?: string;
  avatar?: string | null;
}

export interface Account {
  id?: string;
  user_id?: string;
  balance: number;
  currency: string;
  sfd_id?: string;
  last_updated?: string;
  account_number?: string;
  status?: 'active' | 'inactive' | 'frozen';
}

export interface TransactionFilters {
  period?: 'today' | 'week' | 'month' | 'year' | 'all';
  type?: 'all' | 'deposit' | 'withdrawal';
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}
