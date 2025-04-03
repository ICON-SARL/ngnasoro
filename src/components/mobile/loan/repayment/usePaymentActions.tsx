
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UsePaymentActionsProps {
  loanId?: string;
  onMobileMoneyPayment: () => void;
  sfdId?: string;
}

export function usePaymentActions({ loanId, onMobileMoneyPayment, sfdId }: UsePaymentActionsProps) {
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
          loanId,
          sfdId 
        } 
      });
    } else {
      // Agency QR code payment
      onMobileMoneyPayment();
    }
  };

  const handleLoanApplication = (sfdId?: string) => {
    navigate('/mobile-flow/loan-application', {
      state: {
        sfdId
      }
    });
  };

  return {
    isProcessing,
    handlePaymentMethod,
    handleLoanApplication
  };
}
