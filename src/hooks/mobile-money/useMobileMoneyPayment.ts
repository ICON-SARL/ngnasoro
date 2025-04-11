
import { useState } from 'react';
import { useToast } from '../use-toast';
import { mobileMoneyApi } from '@/utils/mobileMoneyApi';
import type { MobileMoneyPaymentHook, MobileMoneyResponse } from './types';

export function useMobileMoneyPayment(): MobileMoneyPaymentHook {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const processPayment = async (
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
      const result = await mobileMoneyApi.initiatePayment(phoneNumber, amount, provider);
      
      if (result.success) {
        toast({
          title: "Payment Initiated",
          description: "Check your phone to confirm the payment",
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.message || "Unable to process payment",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while processing payment",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message || "Payment processing failed"
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    processPayment
  };
}
