
export interface MobileMoneyProvider {
  id: string;
  name: string;
  logo?: string;
}

export interface MobileMoneyPaymentHook {
  isProcessingPayment: boolean;
  makePayment: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  processMobileMoneyPayment: (
    phoneNumber: string, 
    amount: number, 
    provider: string,
    isRepayment?: boolean,
    loanId?: string
  ) => Promise<boolean>;
}

export interface MobileMoneyWithdrawalHook {
  isProcessingWithdrawal: boolean;
  makeWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
}

export interface QRCodeRequest {
  amount: number;
  loanId?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrCodeData?: string;
  qrCode?: {
    code: string;
    expiresAt: string;
  };
  expiration?: string;
  transactionId?: string;
  error?: string;
}

export interface QRCodeGenerationHook {
  isProcessingQRCode: boolean;
  generatePaymentQRCode: (amount: number, loanId?: string) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

export interface MobileMoneyOperationsHook {
  isProcessingPayment: boolean;
  isProcessingWithdrawal: boolean;
  isProcessingQRCode: boolean;
  makePayment: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  makeWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  generatePaymentQRCode: (amount: number, loanId?: string) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
  mobileMoneyProviders: MobileMoneyProvider[];
}
