
export interface SfdData {
  id: string;
  name: string;
  region?: string;
  code: string;
  logo_url?: string;
  token?: string | null;
  lastFetched?: Date | null;
  status: 'active' | 'inactive' | string;
}

export interface SfdAccount {
  id: string;
  name: string;
  region?: string;
  code?: string;
  logoUrl?: string;
  logo_url?: string;
  status?: string;
  balance?: number;
  currency?: string;
  loans?: SfdLoan[];
  isDefault?: boolean;
  isVerified?: boolean;
}

export interface SfdBalanceData {
  id?: string;
  balance: number;
  currency: string;
  last_updated?: string;
  account_id?: string;
  sfdName?: string;
  name?: string;
  logo_url?: string;
  logoUrl?: string;
  code?: string;
  region?: string;
}

export interface SfdLoan {
  id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  next_payment_date?: string;
  last_payment_date?: string;
  status: string;
  created_at: string;
  remainingAmount?: number;
  isLate?: boolean;
  nextDueDate?: string;
}

export interface UserSfd {
  user_id: string;
  sfd_id: string;
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code: string;
    region?: string;
    logo_url?: string | null;
  };
}

export interface SyncResult {
  success: boolean;
  message: string;
  updatedAccounts?: number;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod?: string;
  description?: string;
}

export interface QRCodeRequest {
  amount: number;
  reference: string;
  merchant_id: string;
  description?: string;
}
