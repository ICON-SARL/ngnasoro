
export interface SfdClient {
  id: string;
  full_name: string;
  sfd_id: string;
  user_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  id_type?: string;
  id_number?: string;
  status: string;
  kyc_level?: number;
  created_at: string;
  validated_at?: string;
  validated_by?: string;
  notes?: string;
}

// Add the types referenced in the errors
export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  interest_rate: number;
  duration_months: number;
  status: string;
  approved_at?: string;
  approved_by?: string;
  disbursed_at?: string;
  created_at: string;
  purpose?: string;
  repayment_frequency?: string;
}

export interface LoanWithSfd extends Loan {
  sfd_name?: string;
  client_name?: string;
}

export interface LoanApplication {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  purpose: string;
  status: string;
  created_at: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

export interface LoanPlan {
  id: string;
  sfd_id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  min_duration: number;
  max_duration: number;
  frequency: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface CreateLoanInput {
  client_id: string;
  sfd_id: string;
  amount: number;
  interest_rate: number;
  duration_months: number;
  purpose?: string;
  repayment_frequency?: string;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  details: string;
  created_at: string;
}

export interface ClientNotification {
  id: string;
  client_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  description: string;
  status: string;
  allocated_at: string;
  allocated_by: string;
}
