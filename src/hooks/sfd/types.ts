
export interface SfdData {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string;
  description?: string;
  settings?: Record<string, any>;
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

export interface SfdAccount {
  id: string;
  name: string;
  description?: string; // Added this property
  logoUrl?: string | null;
  code?: string;
  region?: string;
  balance?: number;
  currency?: string;
  isDefault?: boolean;
  isVerified?: boolean;
  status?: string; // Added this property
  loans?: SfdLoan[];
  sfd_id?: string;
  account_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SfdClientAccount extends SfdAccount {
  description?: string; // Added this property for components that need it
  status?: string; // Added this property for components that need it
}
