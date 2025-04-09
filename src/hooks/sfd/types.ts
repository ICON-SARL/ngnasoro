
export interface SfdBalanceData {
  id: string;
  balance: number;
  currency: string;
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
}
