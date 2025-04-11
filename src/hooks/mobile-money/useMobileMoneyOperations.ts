
import { useState } from 'react';
import { MobileMoneyProvider, MobileMoneyOperationsHook } from './types';
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';

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
