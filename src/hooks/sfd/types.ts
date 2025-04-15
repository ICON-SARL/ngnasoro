
export interface SfdClientAccount {
  id: string;
  name: string;
  logoUrl: string | null;
  logo_url: string | null;
  code: string;
  region: string;
  balance: number;
  currency: string;
  isDefault: boolean;
  isVerified: boolean;
  status: string;
  sfd_id: string;
  account_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  loans: SfdLoan[];
}

export interface SfdAccount {
  id: string;
  name: string;
  code: string;
  region: string;
  logoUrl?: string | null;
  logo_url?: string | null;
  balance: number;
  currency: string;
  isDefault?: boolean;
  isVerified?: boolean;
  status: string;
  sfd_id: string;
  account_type: string;
  description?: string | null;
  created_at: string;
  updated_at?: string;
  loans?: SfdLoan[];
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  updates: Array<{
    sfdId: string;
    name: string;
    newBalance?: number;
  }>;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}

export interface SfdData {
  id: string;
  name: string;
  accounts?: SfdAccount[];
  loans?: SfdLoan[];
  balance?: number;
  code?: string;
  region?: string;
}
