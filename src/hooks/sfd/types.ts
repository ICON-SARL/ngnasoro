export interface SfdData {
  id: string;
  name: string;
  logo_url?: string;
  code?: string;
  region?: string;
  status: string;
  balance?: number;
  currency?: string;
  token?: string | null;
  lastFetched?: Date | null;
  is_default?: boolean;
}

export interface QRCodeRequest {
  userId: string;
  sfdId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'loan_payment';
  loanId?: string;
  reference?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  updates?: any;
}

export interface SfdClientAccount {
  id: string;
  name: string;
  logoUrl?: string | null;
  code?: string;
  region?: string;
  balance: number;
  currency: string;
  isDefault?: boolean;
  isVerified?: boolean;
  status?: string;
  loans?: SfdLoan[];
  token?: string;
  lastFetched?: Date;
  sfd_id: string;
  account_type?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type SfdAccount = SfdClientAccount;

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}

export interface UserSfd {
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code?: string;
    region?: string;
    logo_url?: string | null;
  };
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}
