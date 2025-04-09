
import { useState } from 'react';
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';
import { useQRCodeGeneration } from './useQRCodeGeneration';
import { MobileMoneyOperationsHook, MobileMoneyProvider } from './types';

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  // Get the hooks for each separate operation
  const { isProcessingPayment, makePayment, processMobileMoneyPayment } = useMobileMoneyPayment();
  const { isProcessingWithdrawal, makeWithdrawal } = useMobileMoneyWithdrawal();
  const { isProcessingQRCode, generatePaymentQRCode, generateWithdrawalQRCode } = useQRCodeGeneration();
  
  // Define available mobile money providers
  const mobileMoneyProviders: MobileMoneyProvider[] = [
    { id: 'orange', name: 'Orange Money', logo: '/assets/logos/orange-money.png' },
    { id: 'mtn', name: 'MTN Mobile Money', logo: '/assets/logos/mtn-money.png' },
    { id: 'wave', name: 'Wave', logo: '/assets/logos/wave.png' }
  ];
  
  // Combine all the hooks into a single interface
  return {
    isProcessingPayment,
    isProcessingWithdrawal,
    isProcessingQRCode,
    makePayment,
    makeWithdrawal,
    generatePaymentQRCode,
    generateWithdrawalQRCode,
    mobileMoneyProviders
  };
}
