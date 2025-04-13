
export interface SfdData {
  id: string;
  name: string;
  region?: string;
  code: string;
  logo_url?: string;
  status: 'active' | 'inactive' | string;
  is_default?: boolean;
  token?: string;
  lastFetched?: Date;
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

// Add missing types that were causing errors
export interface SfdAccount {
  id: string;
  name: string;
  code: string;
  region?: string;
  logoUrl?: string;
  balance: number;
  currency: string;
  isDefault?: boolean;
  isVerified?: boolean;
  status: string;
}

export interface SfdLoan {
  id: string;
  amount: number;
  status: string;
  duration_months: number;
  disbursed_at?: string;
  next_payment_date?: string;
  interest_rate: number;
  monthly_payment: number;
}

export interface SfdBalanceData {
  balance: number;
  currency: string;
  lastUpdated?: string;
}

export interface UserSfd {
  id: string;
  user_id: string;
  sfd_id: string;
  is_default: boolean;
  created_at: string;
  sfds: {
    id: string;
    name: string;
    code: string;
    region?: string;
    logo_url?: string;
  };
}

export interface LoanPaymentParams {
  userId: string;
  sfdId: string;
  loanId: string;
  amount: number;
  paymentMethod?: string;
  description?: string;
  reference?: string;
}
