
export interface Loan {
  id: string;
  client_id: string;
  client_name?: string;
  amount: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'defaulted';
  duration_months: number;
  interest_rate: number;
  purpose: string;
  created_at: string;
  subsidy_amount?: number;
  reference?: string;
}

export interface SfdClient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  status: string;
  account_balance?: number;
  active_loans?: number;
}

export interface ClientAdhesionRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
