
import { useState, useEffect } from 'react';
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';
import type { MobileMoneyOperationsHook, MobileMoneyProvider } from './types';

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { isProcessing: isProcessingPayment, error: paymentError, processPayment: originalProcessPayment } = useMobileMoneyPayment();
  const { isProcessing: isProcessingWithdrawal, error: withdrawalError, processWithdrawal: originalProcessWithdrawal } = useMobileMoneyWithdrawal();
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
  
  // Wrapper for processPayment to match the interface
  const processPayment = async ({
    amount,
    phoneNumber,
    provider,
    description,
    loanId
  }: {
    amount: number;
    phoneNumber: string;
    provider: string;
    description?: string;
    loanId?: string;
  }): Promise<boolean> => {
    return originalProcessPayment(phoneNumber, amount, provider, loanId);
  };
  
  // Wrapper for processWithdrawal to match the interface
  const processWithdrawal = async ({
    amount,
    phoneNumber,
    provider,
    description
  }: {
    amount: number;
    phoneNumber: string;
    provider: string;
    description?: string;
  }): Promise<boolean> => {
    return originalProcessWithdrawal(phoneNumber, amount, provider);
  };
  
  return {
    isProcessingPayment,
    isProcessingWithdrawal,
    error,
    processPayment,
    processWithdrawal,
    mobileMoneyProviders
  };
}
