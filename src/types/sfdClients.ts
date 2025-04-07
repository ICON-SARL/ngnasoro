
export interface SfdClient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  sfd_id: string;
  user_id?: string;
  status: 'pending' | 'validated' | 'rejected' | 'suspended';
  kyc_level: number;
  created_at: string;
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
  performed_at: string;
  performed_by?: string;
}

// Add missing types for Loan, LoanPayment and SfdSubsidy
export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'defaulted';
  purpose?: string;
  approved_at?: string;
  approved_by?: string;
  disbursed_at?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  reference_number?: string;
  notes?: string;
}

export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  purpose: string;
  region?: string;
  requested_by: string;
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  rejected_reason?: string;
  disbursed_at?: string;
  priority: 'low' | 'medium' | 'high';
  documents?: string[];
}
