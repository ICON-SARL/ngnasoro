
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentActionsProps {
  loanId: string;
  onMobileMoneyPayment: () => void;
}

export function usePaymentActions({ loanId, onMobileMoneyPayment }: PaymentActionsProps) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePaymentMethod = (method: 'mobile' | 'agency' | 'bank') => {
    if (method === 'mobile') {
      onMobileMoneyPayment();
    } else if (method === 'agency') {
      navigate(`/mobile-flow/payment?loanId=${loanId}`);
    }
  };
  
  return {
    isProcessing,
    handlePaymentMethod
  };
}
