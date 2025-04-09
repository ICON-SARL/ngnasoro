
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { processMobileMoneyPayment } from '../sfd/sfdAccountsApi';
import { MobileMoneyWithdrawalHook } from './types';

export function useMobileMoneyWithdrawal(): MobileMoneyWithdrawalHook {
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const { user } = useAuth();
  
  const makeWithdrawal = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
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
      
      return result.success;
    } catch (error: any) {
      console.error('Failed to process mobile money withdrawal:', error);
      return false;
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };
  
  return {
    isProcessingWithdrawal,
    makeWithdrawal
  };
}
