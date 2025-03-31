
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UsePaymentActionsProps {
  loanId?: string;
  onMobileMoneyPayment: () => void;
}

export function usePaymentActions({ loanId, onMobileMoneyPayment }: UsePaymentActionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePaymentMethod = (method: 'mobile' | 'agency') => {
    if (method === 'mobile') {
      if (!loanId) {
        toast({
          title: "Erreur",
          description: "Identifiant de prêt manquant",
          variant: "destructive",
        });
        return;
      }
      
      // Pass the loanId in state so the payment page knows it's for a loan repayment
      navigate('/mobile-flow/secure-payment', { 
        state: { 
          isRepayment: true, 
          loanId 
        } 
      });
    } else {
      // Agency QR code payment
      onMobileMoneyPayment();
    }
  };

  return {
    isProcessing,
    handlePaymentMethod
  };
}
