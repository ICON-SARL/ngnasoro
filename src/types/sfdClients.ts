
export interface SfdClient {
  id: string;
  user_id: string;
  sfd_id: string;
  client_number?: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected' | 'validated' | 'suspended';
  created_at: string;
  updated_at: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  kyc_level?: number;
  notes?: string;
  validated_at?: string;
  validated_by?: string;
}

export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  loan_plan_id: string;
  amount: number;
  term?: number;
  duration_months?: number;
  interest_rate: number;
  fees: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'paid' | 'defaulted' | 'completed';
  created_at: string;
  created_by: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  disbursed_at?: string;
  disbursed_by?: string;
  disbursement_status?: string;
  disbursement_date?: string;
  disbursement_reference?: string;
  total_paid?: number;
  next_payment_date?: string;
  monthly_payment?: number;
  reference?: string;
  client_name?: string;
  subsidy_amount?: number;
  sfds?: {
    name: string;
    logo_url: string;
  };
}

export interface LoanPlan {
  id: string;
  sfd_id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
  created_at: string;
  is_subsidized?: boolean;
  subsidy_rate?: number;
  sfds?: {
    name: string;
    logo_url: string;
  };
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  recorded_by: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  created_at: string;
}

export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  used_amount: number;
  remaining_amount: number;
  status: 'active' | 'exhausted' | 'expired';
  created_at: string;
  allocated_by: string;
  end_date?: string;
  description?: string;
}

// Add missing ClientDocument type
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

// Add missing ClientActivity type
export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description: string;
  performed_at: string;
  performed_by?: string;
}

// Add missing ClientNotification type
export interface ClientNotification {
  id: string;
  client_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type: string;
  reference_id?: string;
}
