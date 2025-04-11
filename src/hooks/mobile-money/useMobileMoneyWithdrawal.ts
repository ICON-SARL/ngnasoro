
import { useState } from 'react';
import { useToast } from '../use-toast';
import { mobileMoneyApi } from '@/utils/mobileMoneyApi';
import type { MobileMoneyWithdrawalHook, MobileMoneyResponse } from './types';

export function useMobileMoneyWithdrawal(): MobileMoneyWithdrawalHook {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const processWithdrawal = async (
    amount: number, 
    phoneNumber: string, 
    provider: string
  ): Promise<MobileMoneyResponse> => {
    if (!amount || amount <= 0) {
      return {
        success: false,
        error: "Amount must be greater than zero"
      };
    }
    
    if (!phoneNumber) {
      return {
        success: false,
        error: "Phone number is required"
      };
    }
    
    setIsProcessing(true);
    
    try {
      const result = await mobileMoneyApi.initiateWithdrawal(phoneNumber, amount, provider);
      
      if (result.success) {
        toast({
          title: "Withdrawal Initiated",
          description: "Check your phone to confirm the withdrawal",
        });
      } else {
        toast({
          title: "Withdrawal Failed",
          description: result.message || "Unable to process withdrawal",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while processing withdrawal",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message || "Withdrawal processing failed"
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    processWithdrawal
  };
}
