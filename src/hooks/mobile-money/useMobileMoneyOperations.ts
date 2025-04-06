
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { processMobileMoneyPayment } from '../sfd/sfdAccountsApi';
import { MobileMoneyOperationsHook } from './types';

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  
  // Define mobile money providers specific to Mali
  const mobileMoneyProviders = [
    {
      id: 'orange',
      name: 'Orange Money',
      code: 'orange',
      icon: 'OM'
    },
    {
      id: 'moov',
      name: 'Moov Money',
      code: 'moov',
      icon: 'MV'
    },
    {
      id: 'malitel',
      name: 'Malitel Money',
      code: 'malitel',
      icon: 'MM'
    }
  ];
  
  const processPayment = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await processMobileMoneyPayment(
        user.id,
        phoneNumber,
        amount,
        provider,
        false // Not a repayment by default
      );
      
      return result.success;
    } catch (error: any) {
      console.error('Failed to process mobile money payment:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const processWithdrawal = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // Use the same function but with different parameters
      const result = await processMobileMoneyPayment(
        user.id,
        phoneNumber,
        amount,
        provider,
        false // Not a repayment for withdrawals
      );
      
      return result.success;
    } catch (error: any) {
      console.error('Failed to process mobile money withdrawal:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    mobileMoneyProviders,
    defaultProvider: 'orange',
    isProcessing,
    processPayment,
    processWithdrawal
  };
}
