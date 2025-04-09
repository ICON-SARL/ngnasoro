
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
  
  return {
    processPayment,
    isLoading,
    error,
    transactionId
  };
}

export default useMobileMoneyPayment;
