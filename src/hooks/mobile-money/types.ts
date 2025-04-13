
// Types for Mobile Money operations

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

export interface MobileMoneyResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
}

export interface QRCodeGenerationHook {
  qrCodeData: string | null;
  isGenerating: boolean;
  error: string | null;
  generateQRCode: (amount: number, loanId?: string, isWithdrawal?: boolean) => Promise<string | null>;
  resetQRCode: () => void;
}

export interface MobileMoneyOperationsHook {
  isProcessingPayment: boolean;
  isProcessingWithdrawal: boolean;
  error: string | null;
  processPayment: (phoneNumber: string, amount: number, provider: string, loanId?: string) => Promise<boolean>;
  processWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  qrCodeData: string | null;
  isGeneratingQRCode: boolean;
  generateQRCode: (amount: number, loanId?: string, isWithdrawal?: boolean) => Promise<string | null>;
  resetQRCode: () => void;
  // Add the missing properties:
  mobileMoneyProviders: Array<{id: string; name: string}>;
  isProcessing: boolean;
}
