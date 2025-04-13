
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
  created_at: string;
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}
