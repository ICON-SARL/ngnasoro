
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';
import { useQRCodeGeneration } from './useQRCodeGeneration';
import { useState } from 'react';
import { MobileMoneyOperationsHook, MobileMoneyPaymentHook, MobileMoneyWithdrawalHook, QRCodeGenerationHook } from './types';
import { MobileMoneyResponse, QRCodeResponse } from '@/utils/mobileMoneyApi';

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { isProcessingPayment, processMobileMoneyPayment: processPayment } = useMobileMoneyPayment();
  const { isProcessingWithdrawal, processMobileMoneyWithdrawal: processWithdrawal } = useMobileMoneyWithdrawal();
  const { isProcessingQRCode, generatePaymentQRCode, generateWithdrawalQRCode } = useQRCodeGeneration();
  
  const isProcessing = isProcessingPayment || isProcessingWithdrawal || isProcessingQRCode;
  
  const processMobileMoneyPayment = async (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave",
    loanId?: string
  ): Promise<MobileMoneyResponse> => {
    return processPayment(phoneNumber, amount, provider, loanId);
  };
  
  const processMobileMoneyWithdrawal = async (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ): Promise<MobileMoneyResponse> => {
    return processWithdrawal(phoneNumber, amount, provider);
  };
  
  return {
    isProcessing,
    processMobileMoneyPayment,
    processMobileMoneyWithdrawal,
    generatePaymentQRCode,
    generateWithdrawalQRCode
  };
}

export { useMobileMoneyPayment } from './useMobileMoneyPayment';
export { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';
export { useQRCodeGeneration } from './useQRCodeGeneration';
export type { MobileMoneyOperationsHook, MobileMoneyPaymentHook, MobileMoneyWithdrawalHook, QRCodeGenerationHook } from './types';
