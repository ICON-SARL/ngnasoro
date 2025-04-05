
import { MobileMoneyResponse, QRCodeResponse } from '@/utils/mobileMoneyApi';

export interface MobileMoneyPaymentHook {
  isProcessingPayment: boolean;
  processMobileMoneyPayment: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave",
    loanId?: string
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

export interface MobileMoneyOperationsHook {
  isProcessing: boolean;
  processMobileMoneyPayment: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave",
    loanId?: string
  ) => Promise<MobileMoneyResponse>;
  processMobileMoneyWithdrawal: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ) => Promise<MobileMoneyResponse>;
}

export interface QRCodeGenerationHook {
  isProcessingQRCode: boolean;
  generatePaymentQRCode: (amount: number, loanId?: string) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}
