
import { useState } from 'react';
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';
import type { MobileMoneyOperationsHook } from './types';

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { isProcessing: isProcessingPayment, error: paymentError, processPayment } = useMobileMoneyPayment();
  const { isProcessing: isProcessingWithdrawal, error: withdrawalError, processWithdrawal } = useMobileMoneyWithdrawal();
  const [error, setError] = useState<string | null>(null);
  
  // Combined error state from both operations
  useState(() => {
    setError(paymentError || withdrawalError || null);
  }, [paymentError, withdrawalError]);
  
  return {
    isProcessingPayment,
    isProcessingWithdrawal,
    error,
    processPayment,
    processWithdrawal
  };
}
