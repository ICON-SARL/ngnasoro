
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
  // Adding missing properties
  client_name?: string;
  reference?: string;  // Explicitly add the optional reference property
  updated_at?: string;  // Explicitly add the optional updated_at property
}
