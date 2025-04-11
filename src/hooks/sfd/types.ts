
// Add SfdData to the existing file
export interface SfdData {
  id: string;
  name: string;
  logo_url?: string;
  code?: string;
  region?: string;
  status: string;
  balance?: number;
  currency?: string;
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

// Add interfaces for SfdAccount, SfdLoan
export interface SfdAccount {
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
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate: boolean;
}

// Add UserSfd interface
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

// Add SfdBalanceData interface
export interface SfdBalanceData {
  balance: number;
  currency: string;
}

// Add LoanPaymentParams interface
export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}
