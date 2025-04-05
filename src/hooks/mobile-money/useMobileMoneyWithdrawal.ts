
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { processMobileMoneyPayment } from '../sfd/sfdAccountsApi';
import { MobileMoneyWithdrawalHook } from './types';
import { MobileMoneyResponse } from '@/utils/mobileMoneyApi';

export function useMobileMoneyWithdrawal(): MobileMoneyWithdrawalHook {
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const { user } = useAuth();
  
  const processMobileMoneyWithdrawalFn = async (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ): Promise<MobileMoneyResponse> => {
    if (!user?.id) {
      return {
        success: false,
        message: "User not authenticated",
        transactionId: null
      };
    }
    
    setIsProcessingWithdrawal(true);
    
    try {
      // Use the same function but with different parameters
      const result = await processMobileMoneyPayment(
        user.id,
        phoneNumber,
        amount,
        provider,
        false // Not a repayment for withdrawals
      );
      
      return {
        success: result.success,
        message: result.message || "Withdrawal successful",
        transactionId: `mmw-${Date.now()}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to process mobile money withdrawal",
        transactionId: null
      };
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };
  
  return {
    isProcessingWithdrawal,
    processMobileMoneyWithdrawal: processMobileMoneyWithdrawalFn
  };
}
