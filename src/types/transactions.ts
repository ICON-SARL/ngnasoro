
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
  // Add fields that exist in the database table but aren't in our type
  date?: string;
  name?: string;
  avatar_url?: string;
}

export interface Account {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

export interface TransactionStats {
  totalCount: number;
  totalVolume: number;
  averageAmount: number;
  successRate: number;
  pendingCount: number;
  flaggedCount: number;
}

// Database record interface to help with type conversion
export interface DatabaseTransactionRecord {
  id: string;
  amount: number;
  avatar_url?: string;
  created_at?: string;
  date?: string;
  name: string;
  type: string;
  user_id: string;
  sfd_id?: string;
}
