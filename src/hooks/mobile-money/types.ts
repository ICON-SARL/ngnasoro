
export interface QRCodeGenerationHook {
  isProcessingQRCode: boolean;
  generatePaymentQRCode: (amount: number, loanId?: string) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

export interface QRCodeResponse {
  success: boolean;
  qrData?: string;
  transactionId?: string;
  expiresAt?: string;
  error?: string;
}

export interface MobileMoneyPaymentHook {
  isProcessing: boolean;
  processPayment: (amount: number, phoneNumber: string, provider: string) => Promise<MobileMoneyResponse>;
}

export interface MobileMoneyWithdrawalHook {
  isProcessing: boolean;
  processWithdrawal: (amount: number, phoneNumber: string, provider: string) => Promise<MobileMoneyResponse>;
}

export interface MobileMoneyOperationsHook {
  isProcessing: boolean;
  processPayment: (amount: number, phoneNumber: string, provider: string) => Promise<MobileMoneyResponse>;
  processWithdrawal: (amount: number, phoneNumber: string, provider: string) => Promise<MobileMoneyResponse>;
}

export interface MobileMoneyResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}
