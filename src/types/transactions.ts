
export interface Transaction {
  id: number | string;
  name: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_repayment' | 'loan_disbursement' | 'reversal' | 'other';
  amount: number;
  date: string;
  status?: 'pending' | 'completed' | 'failed' | 'success' | 'flagged' | 'disputed' | 'reversed';
  description?: string;
  category?: string;
  reference?: string;
  reference_id?: string;
  avatar?: string | null;
  avatar_url?: string;
  payment_method?: string;
  created_at?: string;
  user_id?: string;
  sfd_id?: string;
  metadata?: {
    agency?: string;
    [key: string]: any;
  };
  affects_balance?: boolean;
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

export interface TransactionDispute {
  id: string;
  transaction_id: string;
  reason: string;
  description: string;
  evidence_urls?: string[];
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface TransactionFilters {
  period?: 'today' | 'week' | 'month' | 'year' | 'all';
  type?: 'all' | 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_repayment' | 'loan_disbursement' | 'reversal' | 'other';
  status?: 'pending' | 'completed' | 'failed' | 'success' | 'flagged' | 'disputed' | 'reversed';
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface TransactionStats {
  totalAmount: number;
  incomeAmount: number;
  expenseAmount: number;
  count: number;
}
