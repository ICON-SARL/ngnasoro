
// Re-export from each hook module
export type { MobileMoneyOperationsHook } from './useMobileMoneyOperations';
export type { QRCodeGenerationHook } from './useQRCodeGeneration';

// Add missing types for Mobile Money Payment and Withdrawal
export interface MobileMoneyResponse {
  success: boolean;
  transactionId: string | null;
  message?: string;
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
