
import { QRCodeResponse } from '@/utils/mobileMoneyApi';

export interface MobileMoneyPaymentHook {
  isProcessingPayment: boolean;
  makePayment: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  processMobileMoneyPayment: (phoneNumber: string, amount: number, provider: string, isRepayment?: boolean, loanId?: string) => Promise<boolean>;
}

export interface MobileMoneyWithdrawalHook {
  isProcessingWithdrawal: boolean;
  makeWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
}

export interface QRCodeGenerationHook {
  isProcessingQRCode: boolean;
  generatePaymentQRCode: (amount: number, loanId?: string) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

export interface MobileMoneyOperationsHook {
  mobileMoneyProviders: {
    id: string;
    name: string;
    code: string;
    icon: string;
  }[];
  defaultProvider: string;
  isProcessing: boolean;
  processPayment: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  processWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
}
