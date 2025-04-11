
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
  QRCodeResponse,
  MobileMoneyProvider 
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
  type QRCodeResponse,
  type MobileMoneyProvider
};

// Define available mobile money providers
const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  { id: 'orange', name: 'Orange Money' },
  { id: 'wave', name: 'Wave' },
  { id: 'moov', name: 'Moov Money' }
];

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { isProcessing: isPaymentProcessing, processPayment } = useMobileMoneyPayment();
  const { isProcessing: isWithdrawalProcessing, processWithdrawal } = useMobileMoneyWithdrawal();

  return {
    isProcessing: isPaymentProcessing || isWithdrawalProcessing,
    processPayment,
    processWithdrawal,
    mobileMoneyProviders: MOBILE_MONEY_PROVIDERS
  };
}
