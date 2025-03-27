
export interface Transaction {
  id: string;
  user_id?: string;
  sfd_id?: string;
  client_id?: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_disbursement' | 'other';
  amount: number;
  currency?: string;
  status: 'pending' | 'success' | 'failed' | 'flagged';
  description?: string;
  metadata?: Record<string, any>;
  payment_method?: string;
  reference_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface TransactionStats {
  totalCount: number;
  totalVolume: number;
  averageAmount: number;
  successRate: number;
  pendingCount: number;
  flaggedCount: number;
}
