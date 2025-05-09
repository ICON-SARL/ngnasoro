
export interface SyncResult {
  success: boolean;
  message: string;
  error?: any;
  syncedAccounts?: SfdAccount[]; // Added this property
}

export interface SfdAccount {
  id: string;
  name?: string;
  code?: string;
  region?: string;
  logo_url?: string;
  logoUrl?: string; // Added for compatibility
  balance?: number;
  currency?: string;
  isDefault?: boolean;
  is_default?: boolean; // Added for backward compatibility
  isVerified?: boolean;
  status?: string;
  sfd_id?: string;
  account_type?: string;
  created_at?: string;
  updated_at?: string;
  description?: string; // Added this property
}

export interface SfdClientAccount extends SfdAccount {
  loans?: SfdLoan[];
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount?: number;
  nextDueDate?: string;
  next_payment_date?: string; // Added for compatibility
  isLate?: boolean;
  monthly_payment?: number;
  purpose?: string;
  status?: string;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  reference?: string;
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
}

export interface SfdData {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  token?: string | null;
  lastFetched?: Date | null;
  logo_url?: string;
}

// Add any other missing types needed by the application
