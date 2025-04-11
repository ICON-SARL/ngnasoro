
// Re-export the hooks and their types
import { useQRCodeGeneration } from './useQRCodeGeneration';
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';

// Export types from the types file
import { 
  QRCodeGenerationHook, 
  MobileMoneyPaymentHook,
  MobileMoneyWithdrawalHook,
  MobileMoneyOperationsHook,
  MobileMoneyResponse,
  QRCodeResponse 
} from './types';

export {
  useQRCodeGeneration,
  useMobileMoneyPayment,
  useMobileMoneyWithdrawal,
  // Export types
  type QRCodeGenerationHook,
  type MobileMoneyPaymentHook,
  type MobileMoneyWithdrawalHook,
  type MobileMoneyOperationsHook,
  type MobileMoneyResponse,
  type QRCodeResponse
};

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { isProcessing: isPaymentProcessing, processPayment } = useMobileMoneyPayment();
  const { isProcessing: isWithdrawalProcessing, processWithdrawal } = useMobileMoneyWithdrawal();

  return {
    isProcessing: isPaymentProcessing || isWithdrawalProcessing,
    processPayment,
    processWithdrawal
  };
}
