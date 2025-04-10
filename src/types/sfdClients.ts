
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
  subsidy_amount?: number;
  subsidy_rate?: number;
  // Don't include updated_at here as it's not part of the Loan type
}

// Add missing interfaces that other files depend on
export interface SfdClient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: string;
  sfd_id: string;
  user_id?: string;
  kyc_level: number;
  created_at: string;
  notes?: string;
  validated_at?: string;
  validated_by?: string;
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
  filename?: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description: string;
  performed_at: string;
  performed_by?: string;
}

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

export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  used_amount: number;
  remaining_amount: number;
  allocated_by: string;
  allocated_at: string;
  end_date?: string;
  status: string;
  description?: string;
}
