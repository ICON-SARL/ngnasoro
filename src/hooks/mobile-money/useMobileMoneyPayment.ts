
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { processMobileMoneyPayment } from '../sfd/sfdAccountsApi';
import { MobileMoneyPaymentHook } from './types';
import { MobileMoneyResponse } from '@/utils/mobileMoneyApi';

export function useMobileMoneyPayment(): MobileMoneyPaymentHook {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { user } = useAuth();
  
  const processMobileMoneyPaymentFn = async (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave",
    loanId?: string
  ): Promise<MobileMoneyResponse> => {
    if (!user?.id) {
      return {
        success: false,
        message: "User not authenticated",
        transactionId: null
      };
    }
    
    setIsProcessingPayment(true);
    
    try {
      const result = await processMobileMoneyPayment(
        user.id,
        phoneNumber,
        amount,
        provider,
        !!loanId, // isRepayment is true if loanId exists
        loanId
      );
      
      return {
        success: result.success,
        message: result.message || "Payment successful",
        transactionId: `mm-${Date.now()}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to process mobile money payment",
        transactionId: null
      };
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  return {
    isProcessingPayment,
    processMobileMoneyPayment: processMobileMoneyPaymentFn
  };
}
