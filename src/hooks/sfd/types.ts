
export interface SfdBalanceData {
  id: string;
  balance: number;
  currency: string;
  name?: string;
  sfdName?: string;
  logoUrl?: string;
  logo_url?: string;
  code?: string;
  region?: string;
}

export interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod?: string;
}

export interface SfdAccount {
  id: string;
  name: string;
  code?: string;
  balance?: number;
  currency?: string;
  loans?: SfdLoan[]; // Using SfdLoan type for better type safety
  logoUrl?: string;
  logo_url?: string;
  region?: string; // Make sure region is optional here
  isDefault?: boolean;
  isVerified?: boolean;
}

export interface SfdData {
  id: string;
  name: string;
  code?: string;
  region?: string;
  token?: string | null;
  lastFetched?: Date | null;
  status?: string;
  logo_url?: string;
}

export interface UserSfd {
  user_id: string;
  sfd_id: string;
  id?: string;
  is_default?: boolean;
  sfds?: {
    id: string;
    name: string;
    code: string;
    region?: string;
    logo_url?: string | null;
  };
}

export interface SfdLoan {
  id: string;
  amount: number;
  duration_months?: number;
  interest_rate?: number;
  monthly_payment?: number;
  next_payment_date?: string;
  last_payment_date?: string;
  status?: string;
  created_at?: string;
  remainingAmount?: number;
  isLate?: boolean;
  nextDueDate?: string;
}

export interface QRCodeRequest {
  userId: string;
  amount: number;
  isWithdrawal: boolean;
}

export interface QRCodeResponse {
  success: boolean;
  qrCode?: {
    code: string;
    expiresAt: string;
    // Other QR code properties
  };
  qrCodeData?: string; // Add this property to match what's being used
  expiration?: string;  // Add this property to match what's being used
  transactionId?: string;
  error?: string;
}
