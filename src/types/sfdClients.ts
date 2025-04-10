
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
}

export interface ClientBalanceOperation {
  clientId: string;
  amount: number;
  operationType: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment';
  description?: string;
  adminId: string;
  reference?: string;
}

// Add missing Loan type definition
export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  interest_rate: number;
  term_months?: number;
  duration_months: number;
  status: string;
  purpose?: string;
  monthly_payment?: number;
  next_payment_date?: string;
  created_at: string;
  updated_at?: string;
  client_name?: string;
  reference?: string;
  subsidy_amount?: number;
  subsidy_rate?: number;
  approved_by?: string;
  approved_at?: string;
  disbursed_at?: string;
  last_payment_date?: string;
}

// Add LoanPayment type
export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  transaction_id?: string;
  created_at: string;
}

// Add missing SfdSubsidy type definition
export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  used_amount: number;
  remaining_amount: number;
  status: 'active' | 'depleted' | 'expired';
  allocated_at: string;
  allocated_by: string;
  end_date?: string;
  description?: string;
}
