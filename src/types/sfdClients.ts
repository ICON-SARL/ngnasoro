
export interface SfdClient {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended' | 'validated';
  kyc_level: 'none' | 'basic' | 'full' | number;
  sfd_id: string;
  profession?: string | null;
  monthly_income?: number | null;
  reference_number?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  notes?: string | null;
  validated_at?: string | null;
}

export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'disbursed' | 'defaulted';
  created_at: string;
  approved_at?: string;
  disbursed_at?: string;
  next_payment_date?: string;
  disbursement_reference?: string;
  reference?: string;
  client_name?: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
  disbursement_status?: string;
  withdrawn?: boolean;
  disbursed?: boolean;
  last_payment_date?: string;
  // Add missing properties
  subsidy_amount?: number;
  subsidy_rate?: number;
  approved_by?: string;
  disbursement_date?: string;
  loan_plan_id?: string;
  rejection_reason?: string;
  processed_at?: string;
  processed_by?: string;
}

export interface LoanApplication {
  sfd_id: string;
  amount: number;
  duration_months: number;
  purpose: string;
  interest_rate?: number;
  supporting_documents?: any[];
}

export interface LoanPlan {
  id: string;
  name: string;
  description?: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  fees: number;
  sfd_id: string;
  is_active: boolean;
  requirements?: string[];
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
}

// Add mobile money interfaces
export interface MobileMoneySettings {
  id: string;
  provider: string;
  api_key?: string;
  api_url?: string;
  webhook_secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MobileMoneyWebhook {
  id: string;
  provider: string;
  reference_id: string;
  phone_number: string;
  amount: number;
  status: string;
  transaction_type: string;
  is_verified: boolean;
  user_id?: string;
  account_id?: string;
  created_at: string;
  processed_at?: string;
  raw_payload?: any;
  signature?: string;
}
