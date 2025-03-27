
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateMobileMoneyTransaction,
  MobileMoneyRequest,
  MobileMoneyResponse
} from '@/utils/mobileMoneyApi';
import { MobileMoneyWithdrawalHook } from './types';

/**
 * Hook for handling mobile money withdrawal operations
 */
export function useMobileMoneyWithdrawal(): MobileMoneyWithdrawalHook {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  
  const processMobileMoneyWithdrawal = async (
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
    
    setIsProcessingWithdrawal(true);
    
    try {
      const request: MobileMoneyRequest = {
        userId: user.id,
        phoneNumber,
        amount,
        provider,
        isWithdrawal: true
      };
      
      const response = await initiateMobileMoneyTransaction(request);
      
      if (response.success) {
        toast({
          title: "Retrait initié",
          description: "Les fonds seront envoyés à votre compte Mobile Money sous peu",
        });
      } else {
        toast({
          title: "Échec du retrait",
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
        message: "Une erreur s'est produite lors du retrait"
      };
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  return {
    isProcessingWithdrawal,
    processMobileMoneyWithdrawal
  };
}
