export interface SfdData {
  id: string;
  name: string;
  code: string;
  region: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}

export interface LoanPlan {
  id: string;
  name: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
  is_published: boolean;
  sfd_id: string;
  created_at?: string;
  updated_at?: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}
