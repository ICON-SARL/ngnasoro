
export interface SfdData {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string;
  description?: string;
  settings?: Record<string, any>;
  token?: string; // Added token property
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
  description?: string;
  logoUrl?: string | null;
  logo_url?: string | null;
  code?: string;
  region?: string;
  balance?: number;
  currency?: string;
  isDefault?: boolean;
  isVerified?: boolean;
  status?: string;
  loans?: SfdLoan[];
  sfd_id?: string;
  account_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SfdClientAccount extends SfdAccount {
  description?: string;
  status?: string;
}

// Add missing types
export interface SyncResult {
  success: boolean;
  message?: string;
  syncedAccounts?: SfdAccount[];
  error?: any;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  reference?: string;
}
