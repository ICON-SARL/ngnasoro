
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';
import { useQRCodeGeneration } from './useQRCodeGeneration';
import { MobileMoneyOperationsHook } from './types';

/**
 * Hook that combines all mobile money operations functionality
 */
export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { 
    isProcessingPayment, 
    processMobileMoneyPayment 
  } = useMobileMoneyPayment();
  
  const { 
    isProcessingWithdrawal, 
    processMobileMoneyWithdrawal 
  } = useMobileMoneyWithdrawal();
  
  const {
    isProcessingQRCode,
    generatePaymentQRCode,
    generateWithdrawalQRCode
  } = useQRCodeGeneration();

  const isProcessing = isProcessingPayment || isProcessingWithdrawal || isProcessingQRCode;

  return {
    isProcessing,
    processMobileMoneyPayment,
    processMobileMoneyWithdrawal,
    generatePaymentQRCode,
    generateWithdrawalQRCode
  };
}

export * from './types';
