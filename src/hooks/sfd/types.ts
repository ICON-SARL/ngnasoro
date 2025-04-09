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
  loans?: any[]; // Adding loans property to fix MultiSFDAccounts errors
}

export interface SfdData {
  id: string;
  name: string;
  // Add other properties as needed
}

export interface UserSfd {
  user_id: string;
  sfd_id: string;
  // Add other properties as needed
}

export interface SfdLoan {
  id: string;
  amount: number;
  // Add other properties as needed
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
  error?: string;
}
