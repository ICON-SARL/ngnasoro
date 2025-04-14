
export interface SfdClient {
  id: string;
  user_id: string;
  sfd_id: string;
  client_number: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  client_id: string;
  sfd_id: string;
  loan_plan_id: string;
  amount: number;
  term: number;
  interest_rate: number;
  fees: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'paid' | 'defaulted';
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
