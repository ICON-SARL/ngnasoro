
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateMobileMoneyTransaction,
  initiateLoanRepayment,
  MobileMoneyResponse
} from '@/utils/mobileMoneyApi';
import { MobileMoneyPaymentHook } from './types';

/**
 * Hook for handling mobile money payments
 */
export function useMobileMoneyPayment(): MobileMoneyPaymentHook {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const processMobileMoneyPayment = async (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave",
    loanId?: string
  ): Promise<MobileMoneyResponse> => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette opération",
        variant: "destructive",
      });
      return { 
        success: false, 
        message: "Utilisateur non authentifié" 
      };
    }
    
    setIsProcessingPayment(true);
    
    try {
      let response;
      
      if (loanId) {
        // If we have a loan ID, this is a loan repayment
        response = await initiateLoanRepayment(
          user.id, 
          loanId, 
          phoneNumber, 
          amount, 
          provider
        );
      } else {
        // Regular payment
        response = await initiateMobileMoneyTransaction({
          userId: user.id,
          phoneNumber,
          amount,
          provider,
          isWithdrawal: false
        });
      }
      
      if (response.success) {
        toast({
          title: "Paiement initié",
          description: response.message || "Votre paiement a été initié avec succès",
        });
      } else {
        toast({
          title: "Échec du paiement",
          description: response.error || "Une erreur s'est produite",
          variant: "destructive",
        });
      }
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
      
      return {
        success: false,
        message: "Une erreur s'est produite lors du traitement du paiement"
      };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return {
    isProcessingPayment,
    processMobileMoneyPayment
  };
}
