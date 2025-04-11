
import { useState } from 'react';
import { useToast } from '../use-toast';
import { mobileMoneyApi } from '@/utils/mobileMoneyApi';
import type { MobileMoneyPaymentHook, MobileMoneyResponse } from './types';

export function useMobileMoneyPayment(): MobileMoneyPaymentHook {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const processPayment = async (
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
      const result = await mobileMoneyApi.initiatePayment(phoneNumber, amount, provider);
      
      if (result.success) {
        toast({
          title: "Payment Initiated",
          description: "Check your phone to confirm the payment",
        });
        return true;
      } else {
        toast({
          title: "Payment Failed",
          description: result.message || "Unable to process payment",
          variant: "destructive",
        });
        setError(result.message || "Payment failed");
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while processing payment",
        variant: "destructive",
      });
      
      setError(error.message || "Payment processing failed");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    error,
    processPayment
  };
}
