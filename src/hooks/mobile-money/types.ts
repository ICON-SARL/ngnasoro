
// Define the available mobile money providers
export interface MobileMoneyProvider {
  id: string;
  name: string;
}

// Define the QR code generation hook response type
export interface QRCodeGenerationHook {
  isGenerating: boolean;
  qrCodeData: string | null;
  error: string | null;
  generateQRCode: (amount: number, type: 'payment' | 'withdrawal') => Promise<boolean>;
  // Add additional properties for the modified implementation
  isProcessingQRCode: boolean;
  generatePaymentQRCode: (amount: number, loanId?: string) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

// Define the mobile money payment hook response type
export interface MobileMoneyPaymentHook {
  isProcessing: boolean;
  error: string | null;
  processPayment: (
    phoneNumber: string,
    amount: number,
    provider: string
  ) => Promise<boolean>;
}

// Define the mobile money withdrawal hook response type
export interface MobileMoneyWithdrawalHook {
  isProcessing: boolean;
  error: string | null;
  processWithdrawal: (
    phoneNumber: string,
    amount: number,
    provider: string
  ) => Promise<boolean>;
}

// Define the overall mobile money operations hook
export interface MobileMoneyOperationsHook {
  isProcessing: boolean;
  processPayment: (
    phoneNumber: string,
    amount: number,
    provider: string
  ) => Promise<boolean>;
  processWithdrawal: (
    phoneNumber: string,
    amount: number,
    provider: string
  ) => Promise<boolean>;
  mobileMoneyProviders: MobileMoneyProvider[];
}

// Define response types for API calls
export interface MobileMoneyResponse {
  success: boolean;
  transactionId: string | null;
  message?: string;
  error?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrData?: string;
  qrCodeData?: string; // Add this for backward compatibility
  expiration?: string;
  expiresAt?: string; // Add this for backward compatibility
  transactionId?: string;
  error?: string;
}
