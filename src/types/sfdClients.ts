
export interface ClientSavingsAccount {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
  last_updated: string;
  last_transaction_date?: string;
}

export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  duration_months: number;
  monthly_payment: number;
  purpose: string;
  status: string;
  created_at: string;
  next_payment_date?: string;
  client_name?: string;
  reference?: string;
  // Don't include updated_at here as it's not part of the Loan type
}
