
export interface MobileMoneyProvider {
  id: string;
  name: string;
  logo?: string;
}

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

export interface MobileMoneyOperationsHook {
  isProcessingPayment: boolean;
  isProcessingWithdrawal: boolean;
  error: string | null;
  processPayment: (params: {
    amount: number;
    phoneNumber: string;
    provider: string;
    description?: string;
    loanId?: string;
  }) => Promise<boolean>;
  processWithdrawal: (params: {
    amount: number;
    phoneNumber: string;
    provider: string;
    description?: string;
  }) => Promise<boolean>;
  mobileMoneyProviders: MobileMoneyProvider[];
}

export interface MobileMoneyPaymentHook {
  isProcessing: boolean;
  error: string | null;
  processPayment: (phoneNumber: string, amount: number, provider: string, loanId?: string) => Promise<boolean>;
}

export interface MobileMoneyWithdrawalHook {
  isProcessing: boolean;
  error: string | null;
  processWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
}

export interface QRCodeGenerationHook {
  qrCodeData: string | null;
  isGenerating: boolean;
  error: string | null;
  transactionId: string | null;
  expiresAt: string | null;
  generateQRCode: (amount: number, type: 'deposit' | 'withdrawal' | 'loan_payment', loanId?: string) => Promise<QRCodeResponse>;
}
