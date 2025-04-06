
// Define interfaces to avoid circular imports
export interface SfdBalanceData {
  balance: number;
  currency: string;
}

export interface SyncResult {
  success: boolean;
  message?: string;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  method?: string;
}

export interface UserSfd {
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code?: string;
    region?: string;
    logo_url?: string;
  };
}

// Add missing types that were being imported elsewhere
export interface SfdAccount {
  id: string;
  name: string;
  logoUrl?: string | null;
  region?: string;
  code?: string;
  isDefault?: boolean;
  balance: number;
  currency: string;
  isVerified?: boolean;
  loans?: SfdLoan[];
}

export interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string;
  isLate?: boolean;
}

export interface SfdData {
  id: string;
  name: string;
  token: string | null;
  lastFetched: Date | null;
}

export interface QRCodeRequest {
  userId: string;
  amount: number;
  purpose: string;
}
