export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  purpose: string;
  status: string;
  approved_at?: string;
  approved_by?: string;
  disbursed_at?: string;
  next_payment_date?: string;
  last_payment_date?: string;
  created_at: string;
  subsidy_amount?: number;
  subsidy_rate?: number;
  client_name?: string;
  reference?: string;
  updated_at?: string;
  is_published?: boolean;
}

export interface SfdClient {
  id: string;
  user_id?: string;
  sfd_id: string;
  status: string;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  kyc_level?: number;
  validated_at?: string;
  validated_by?: string;
  created_at: string;
  notes?: string;
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: string;
  document_url: string;
  uploaded_at: string;
  verified?: boolean;
  verified_at?: string;
  verified_by?: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description?: string;
  performed_at?: string;
  performed_by?: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
  transaction_id?: string;
  created_at: string;
}

export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  used_amount: number;
  remaining_amount: number;
  status: string;
  allocated_by: string;
  allocated_at: string;
  end_date?: string;
  description?: string;
}

export interface ClientNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
  action_link?: string;
}

export interface CreateLoanInput {
  client_id: string;
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  purpose: string;
  monthly_payment: number;
  subsidy_amount?: number;
  subsidy_rate?: number;
}

export interface LoanApplication {
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate?: number;
  purpose: string;
  supporting_documents?: string[];
}

export interface LoanPlan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  is_active: boolean;
  is_published: boolean;
  requirements: string[];
  sfd_id: string;
  created_at: string;
  updated_at: string;
  sfds?: {
    name: string;
    logo_url: string;
  };
}
