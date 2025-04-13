
import { useState, useEffect } from 'react';
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';
import type { MobileMoneyOperationsHook } from './types';

interface MobileMoneyProvider {
  id: string;
  name: string;
}

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { isProcessing: isProcessingPayment, error: paymentError, processPayment } = useMobileMoneyPayment();
  const { isProcessing: isProcessingWithdrawal, error: withdrawalError, processWithdrawal } = useMobileMoneyWithdrawal();
  const [error, setError] = useState<string | null>(null);
  const [mobileMoneyProviders, setMobileMoneyProviders] = useState<MobileMoneyProvider[]>([
    { id: 'orange', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Money' },
    { id: 'moov', name: 'Moov Money' }
  ]);
  
  // Update error state when payment or withdrawal errors change
  useEffect(() => {
    setError(paymentError || withdrawalError || null);
  }, [paymentError, withdrawalError]);
  
  return {
    isProcessingPayment,
    isProcessingWithdrawal,
    error,
    processPayment,
    processWithdrawal,
    mobileMoneyProviders
  };
}
