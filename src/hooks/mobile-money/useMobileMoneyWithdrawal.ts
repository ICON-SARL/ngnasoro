
import { useState } from 'react';
import { useToast } from '../use-toast';
import { mobileMoneyApi } from '@/utils/mobileMoneyApi';
import type { MobileMoneyWithdrawalHook, MobileMoneyResponse } from './types';

export function useMobileMoneyWithdrawal(): MobileMoneyWithdrawalHook {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const processWithdrawal = async (
    phoneNumber: string,
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    if (!amount || amount <= 0) {
      setError("Amount must be greater than zero");
      return false;
    }
    
    if (!phoneNumber) {
      setError("Phone number is required");
      return false;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await mobileMoneyApi.initiateWithdrawal(phoneNumber, amount, provider);
      
      if (result.success) {
        toast({
          title: "Withdrawal Initiated",
          description: "Check your phone to confirm the withdrawal",
        });
        return true;
      } else {
        toast({
          title: "Withdrawal Failed",
          description: result.message || "Unable to process withdrawal",
          variant: "destructive",
        });
        setError(result.message || "Withdrawal failed");
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while processing withdrawal",
        variant: "destructive",
      });
      
      setError(error.message || "Withdrawal processing failed");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    error,
    processWithdrawal
  };
}
