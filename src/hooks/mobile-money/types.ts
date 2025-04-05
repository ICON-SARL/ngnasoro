
import { MobileMoneyResponse, QRCodeResponse } from '@/utils/mobileMoneyApi';

export interface MobileMoneyPaymentHook {
  isProcessingPayment: boolean;
  processMobileMoneyPayment: (phoneNumber: string, amount: number, provider: "orange" | "mtn" | "wave") => Promise<MobileMoneyResponse>;
}

export interface MobileMoneyWithdrawalHook {
  isProcessingWithdrawal: boolean;
  processMobileMoneyWithdrawal: (phoneNumber: string, amount: number, provider: "orange" | "mtn" | "wave") => Promise<MobileMoneyResponse>;
}

export interface QRCodeGenerationHook {
  isProcessingQRCode: boolean;
  generatePaymentQRCode: (amount: number) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

export interface MobileMoneyOperationsHook {
  isProcessing: boolean;
  processMobileMoneyPayment: (phoneNumber: string, amount: number, provider: "orange" | "mtn" | "wave") => Promise<MobileMoneyResponse>;
  processMobileMoneyWithdrawal: (phoneNumber: string, amount: number, provider: "orange" | "mtn" | "wave") => Promise<MobileMoneyResponse>;
  generatePaymentQRCode: (amount: number) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}
