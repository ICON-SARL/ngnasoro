
export interface MobileMoneyResponse {
  success: boolean;
  transactionId: string | null;
  message?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrCodeData?: string;
  expiration?: string;
  transactionId?: string;
  error?: string;
}

export interface MobileMoneyOperationsHook {
  processPayment: (phoneNumber: string, amount: number, provider: string, loanId?: string) => Promise<boolean>;
  processWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  isProcessingPayment: boolean;
  isProcessingWithdrawal: boolean;
  error: string | null;
  mobileMoneyProviders: { id: string; name: string; }[];
}

export interface MobileMoneyPaymentHook {
  isProcessing: boolean;
  error: string | null;
  processPayment: (
    phoneNumber: string,
    amount: number,
    provider: string
  ) => Promise<boolean>;
}

export interface MobileMoneyWithdrawalHook {
  isProcessing: boolean;
  error: string | null;
  processWithdrawal: (
    phoneNumber: string,
    amount: number,
    provider: string
  ) => Promise<boolean>;
}

export interface QRCodeGenerationHook {
  generateQRCode: (amount: number, type: 'deposit' | 'withdrawal' | 'loan_payment') => Promise<QRCodeResponse>;
  qrCodeData: string | null;
  isGenerating: boolean;
  error: string | null;
  transactionId: string | null;
  expiresAt: string | null;
}
