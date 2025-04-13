
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
