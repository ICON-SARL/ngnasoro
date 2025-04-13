
export interface MobileMoneyResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrCodeData?: string;
  transactionId?: string;
  expiration?: string;
  error?: string;
}

export interface MobileMoneyPaymentHook {
  isProcessing: boolean;
  error: string | null;
  processPayment: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
}

export interface MobileMoneyWithdrawalHook {
  isProcessing: boolean;
  error: string | null;
  processWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
}

export interface MobileMoneyProvider {
  id: string;
  name: string;
}

export interface MobileMoneyOperationsHook {
  isProcessingPayment: boolean;
  isProcessingWithdrawal: boolean;
  error: string | null;
  processPayment: (phoneNumber: string, amount: number, provider: string, loanId?: string) => Promise<boolean>;
  processWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  mobileMoneyProviders: MobileMoneyProvider[];
}

export interface QRCodeGenerationHook {
  generateQRCode: (amount: number, type: 'deposit' | 'withdrawal' | 'loan_payment', loanId?: string) => Promise<QRCodeResponse>;
  qrCodeData: string | null;
  isGenerating: boolean;
  error: string | null;
  transactionId: string | null;
  expiresAt: string | null;
}
