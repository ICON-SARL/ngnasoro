
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
