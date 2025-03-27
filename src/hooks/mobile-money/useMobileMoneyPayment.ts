
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateMobileMoneyTransaction,
  MobileMoneyRequest,
  MobileMoneyResponse
} from '@/utils/mobileMoneyApi';
import { MobileMoneyPaymentHook } from './types';

/**
 * Hook pour gérer les paiements Mobile Money
 */
export function useMobileMoneyPayment(): MobileMoneyPaymentHook {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const processMobileMoneyPayment = async (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
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
      const request: MobileMoneyRequest = {
        userId: user.id,
        phoneNumber,
        amount,
        provider,
        isWithdrawal: false
      };
      
      const response = await initiateMobileMoneyTransaction(request);
      
      if (response.success) {
        toast({
          title: "Paiement initié",
          description: "Vérifiez votre téléphone pour confirmer le paiement",
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
        message: "Une erreur s'est produite lors du paiement"
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
