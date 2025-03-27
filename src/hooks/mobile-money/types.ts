
// Types pour l'utilisation de Mobile Money
export interface MobileMoneyPaymentHook {
  isProcessingPayment: boolean;
  processMobileMoneyPayment: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ) => Promise<MobileMoneyResponse>;
}

export interface MobileMoneyWithdrawalHook {
  isProcessingWithdrawal: boolean;
  processMobileMoneyWithdrawal: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ) => Promise<MobileMoneyResponse>;
}

export interface QRCodeGenerationHook {
  isProcessingQRCode: boolean;
  generatePaymentQRCode: (amount: number) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

export interface MobileMoneyOperationsHook {
  isProcessing: boolean;
  processMobileMoneyPayment: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ) => Promise<MobileMoneyResponse>;
  processMobileMoneyWithdrawal: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ) => Promise<MobileMoneyResponse>;
  generatePaymentQRCode: (amount: number) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

export interface MobileMoneyResponse {
  success: boolean;
  message: string;
  transaction?: any;
  reference?: string;
  providerResponse?: {
    status: string;
    providerReference: string;
    estimatedCompletion: string;
  };
  error?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrCode?: {
    userId: string;
    amount: number;
    isWithdrawal: boolean;
    timestamp: number;
    expiresAt: string;
    code: string;
  };
  error?: string;
}
