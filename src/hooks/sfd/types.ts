
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

// Define a client-side SfdAccount interface that will be used throughout the application
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
  // These are for compatibility with the DB SfdAccount type
  sfd_id: string;     // Making this required for compatibility
  account_type?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Export SfdAccount as a type alias for backward compatibility
export type SfdAccount = SfdClientAccount;

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
