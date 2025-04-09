
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { processMobileMoneyPayment } from '../sfd/sfdAccountsApi';

interface MobileMoneyPaymentProps {
  phoneNumber: string;
  amount: number;
  provider: string;
  isRepayment?: boolean;
  loanId?: string;
  onSuccess?: (transactionId?: string) => void;
  onError?: (message: string) => void;
}

export function useMobileMoneyPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { user } = useAuth();

  const processPayment = async ({
    phoneNumber,
    amount,
    provider,
    isRepayment = false,
    loanId,
    onSuccess,
    onError
  }: MobileMoneyPaymentProps) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await processMobileMoneyPayment(
        user?.id || null,
        phoneNumber,
        amount,
        provider,
        isRepayment,
        loanId
      );
      
      if (result.success) {
        setTransactionId(result.transactionId || null);
        if (onSuccess) onSuccess(result.transactionId);
      } else {
        setError(result.message);
        if (onError) onError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // For compatibility with the existing code that might use these properties
  const makePayment = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    try {
      await processPayment({ 
        phoneNumber, 
        amount, 
        provider,
        onSuccess: () => {}, 
        onError: () => {} 
      });
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const processMobileMoneyPaymentFn = async (
    phoneNumber: string, 
    amount: number, 
    provider: string,
    isRepayment: boolean = false,
    loanId?: string
  ): Promise<boolean> => {
    try {
      await processPayment({ 
        phoneNumber, 
        amount, 
        provider, 
        isRepayment, 
        loanId,
        onSuccess: () => {}, 
        onError: () => {} 
      });
      return true;
    } catch (error) {
      return false;
    }
  };
  
  return {
    processPayment,
    isLoading,
    error,
    transactionId,
    // For backwards compatibility
    isProcessingPayment: isLoading,
    makePayment,
    processMobileMoneyPayment: processMobileMoneyPaymentFn
  };
}

export default useMobileMoneyPayment;
