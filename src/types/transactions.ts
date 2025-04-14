
export interface Transaction {
  id: number | string;
  name: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_repayment' | 'loan_disbursement' | 'other';
  amount: number;
  date: string;
  status?: 'pending' | 'completed' | 'failed' | 'success' | 'flagged';
  description?: string;
  category?: string;
  reference?: string;
  reference_id?: string;
  avatar?: string | null;
  avatar_url?: string;
  payment_method?: string;
  created_at?: string;
  metadata?: {
    agency?: string;
    [key: string]: any;
  };
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
  type?: 'all' | 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_repayment' | 'loan_disbursement' | 'other';
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}
