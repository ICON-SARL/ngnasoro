
export interface SfdClient {
  id: string;
  user_id?: string;
  sfd_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: 'pending' | 'validated' | 'rejected';
  created_at: string;
  validated_at?: string;
  validated_by?: string;
  notes?: string;
  kyc_level: number;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: 'id_card' | 'passport' | 'proof_of_address' | 'selfie' | 'other';
  document_url: string;
  verified: boolean;
  uploaded_at: string;
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

export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  purpose: string;
  monthly_payment: number;
  disbursed_at?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  last_payment_date?: string;
  next_payment_date?: string;
  subsidy_amount?: number;
  subsidy_rate?: number;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
}

export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  allocated_at: string;
  allocated_by: string;
  status: 'pending' | 'active' | 'revoked' | 'depleted';
  used_amount: number;
  remaining_amount: number;
  description?: string;
  end_date?: string;
}
