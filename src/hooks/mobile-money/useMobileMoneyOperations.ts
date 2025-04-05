
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { processMobileMoneyPayment } from '../sfd/sfdAccountsApi';
import { MobileMoneyOperationsHook } from './types';
import { MobileMoneyResponse } from '@/utils/mobileMoneyApi';

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const [isProcessing, setIsProcessing] = useState(false);
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
    
    setIsProcessing(true);
    
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
      setIsProcessing(false);
    }
  };
  
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
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    processMobileMoneyPayment: processMobileMoneyPaymentFn,
    processMobileMoneyWithdrawal: processMobileMoneyWithdrawalFn
  };
}
