
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
