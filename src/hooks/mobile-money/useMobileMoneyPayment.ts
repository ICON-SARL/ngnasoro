
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { processMobileMoneyPayment } from '../sfd/sfdAccountsApi';
import { MobileMoneyPaymentHook } from './types';

export function useMobileMoneyPayment(): MobileMoneyPaymentHook {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { user } = useAuth();
  
  const makePayment = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    setIsProcessingPayment(true);
    
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
      setIsProcessingPayment(false);
    }
  };
  
  const processMobileMoneyPaymentFn = async (
    phoneNumber: string, 
    amount: number, 
    provider: string,
    isRepayment: boolean = false,
    loanId?: string
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    setIsProcessingPayment(true);
    
    try {
      const result = await processMobileMoneyPayment(
        user.id,
        phoneNumber,
        amount,
        provider,
        isRepayment,
        loanId
      );
      
      return result.success;
    } catch (error: any) {
      console.error('Failed to process mobile money payment:', error);
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  return {
    isProcessingPayment,
    makePayment,
    processMobileMoneyPayment: processMobileMoneyPaymentFn
  };
}
