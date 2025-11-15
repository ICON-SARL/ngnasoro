
export interface SfdClient {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  status: string;
  sfd_id: string;
  user_id?: string | null;
  updated_at?: string;
}

export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  total_amount: number;
  remaining_amount: number;
  purpose: string;
  status: 'pending' | 'active' | 'rejected' | 'approved' | 'completed' | 'disbursed' | 'defaulted' | string; // Allow string to resolve type errors
  created_at: string;
  approved_at?: string;
  disbursed_at?: string;
  next_payment_date?: string;
  disbursement_reference?: string;
  reference?: string;
  client_name?: string;
  sfd_name?: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
  disbursement_status?: string;
  withdrawn?: boolean;
  disbursed?: boolean;
  last_payment_date?: string;
  subsidy_amount?: number;
  subsidy_rate?: number;
  approved_by?: string;
  disbursement_date?: string;
  loan_plan_id?: string;
  rejection_reason?: string;
  processed_at?: string;
  processed_by?: string;
  updated_at?: string;
}

export interface LoanApplication {
  sfd_id: string;
  amount: number;
  duration_months: number;
  purpose: string;
  interest_rate?: number;
  supporting_documents?: any[];
}

export interface CreateLoanInput {
  client_id: string;
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  purpose: string;
  loan_plan_id?: string;
  subsidy_amount?: number;
  subsidy_rate?: number;
}

export interface LoanPlan {
  id: string;
  name: string;
  description?: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  duration_months: number;
  sfd_id: string;
  is_active: boolean;
  created_at?: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

export interface SfdSubsidy {
  id: string;
  name: string;
  amount: number;
  sponsor_id: string;
  sfd_id: string;
  status: 'pending' | 'active' | 'completed' | 'depleted';
  start_date: string;
  end_date?: string;
  description?: string;
  target_population?: string;
  terms_of_use?: string;
  created_at: string;
  used_amount?: number;
  remaining_amount?: number;
  allocated_at?: string;
  allocated_by?: string;
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

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: string;
  document_url: string;
  uploaded_at: string;
  status: string;
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

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_method: string;
  status: string;
  reference?: string;
  created_at: string;
}

// Mobile money interfaces
export interface MobileMoneySettings {
  id: string;
  operator: string;
  api_key?: string;
  api_secret?: string;
  webhook_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MobileMoneyWebhook {
  id: string;
  operator: string;
  event_type: string;
  payload: any;
  processed: boolean;
  created_at: string;
}
