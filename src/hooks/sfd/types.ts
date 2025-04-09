
export interface SfdData {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  status: string;
}

export interface UserSfd {
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code: string;
    region?: string;
    logo_url?: string;
  };
}

export interface SfdAccount {
  id: string;
  name: string;
  region?: string;
  code: string;
  logo_url?: string; 
  is_default?: boolean;
  balance?: number;
  currency?: string;
  loans?: SfdLoan[];
}

export interface SfdLoan {
  id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  next_payment_date?: string;
  status: string;
  created_at: string;
  purpose: string;
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
}
