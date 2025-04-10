
export interface SfdClient {
  id: string;
  sfd_id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: 'pending' | 'validated' | 'rejected' | 'suspended';
  kyc_level: number;
  created_at?: string;
  validated_at?: string;
  validated_by?: string;
  notes?: string;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: string;
  document_url: string;
  uploaded_at: string;
  verified: boolean;
  verified_at?: string;
  verified_by?: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description?: string;
  performed_by?: string;
  performed_at: string;
}

export interface ClientSavingsAccount {
  id: string;
  client_id: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  last_transaction_date?: string;
  last_updated?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ClientBalanceOperation {
  id?: string;
  clientId: string;
  client_id?: string;
  amount: number;
  operationType: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment';
  operation_type?: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment';
  description?: string;
  adminId: string;
  admin_id?: string;
  reference?: string;
  created_at?: string;
}

export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  interest_rate: number;
  duration_months: number;
  monthly_payment: number;
  purpose: string;
  status: string;
  disbursed_at?: string;
  next_payment_date?: string;
  last_payment_date?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  total_paid?: number;
  remaining_amount?: number;
  reference?: string;
  client_name?: string;
  subsidy_amount?: number;
  term_months?: number;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  status: string;
  payment_method: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
  processed_by?: string;
}

export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'revoked' | 'depleted';
  purpose: string;
  region: string;
  target_clients: number;
  priority: 'low' | 'medium' | 'high';
  approved_by?: string;
  approved_at?: string;
  disbursed_at?: string;
  created_at: string;
  allocated_at?: string;
  end_date?: string;
  description?: string;
  used_amount?: number;
  remaining_amount?: number;
}
