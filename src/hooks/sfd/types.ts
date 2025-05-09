
export interface SyncResult {
  success: boolean;
  message: string;
  error?: any;
}

export interface SfdAccount {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  balance?: number;
  currency?: string;
  isDefault?: boolean;
  isVerified?: boolean;
  status?: string;
  sfd_id?: string;
  account_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoanPaymentParams {
  loanId: string;
  amount: number;
  paymentMethod: string;
  description?: string; // Added description field
  reference?: string;
}
