
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  generateQRCode,
  QRCodeRequest,
  QRCodeResponse
} from '@/utils/mobileMoneyApi';
import { QRCodeGenerationHook } from './types';

/**
 * Hook for handling QR code generation operations
 */
export function useQRCodeGeneration(): QRCodeGenerationHook {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessingQRCode, setIsProcessingQRCode] = useState(false);
  
  const generatePaymentQRCode = async (amount: number): Promise<QRCodeResponse> => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette opération",
        variant: "destructive",
      });
      return { 
        success: false
      };
    }
    
    setIsProcessingQRCode(true);
    
    try {
      const request: QRCodeRequest = {
        userId: user.id,
        amount,
        isWithdrawal: false
      };
      
      const response = await generateQRCode(request);
      
      if (!response.success) {
        toast({
          title: "Échec de génération du QR code",
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
        success: false
      };
    } finally {
      setIsProcessingQRCode(false);
    }
  };
  
  const generateWithdrawalQRCode = async (amount: number): Promise<QRCodeResponse> => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette opération",
        variant: "destructive",
      });
      return { 
        success: false
      };
    }
    
    setIsProcessingQRCode(true);
    
    try {
      const request: QRCodeRequest = {
        userId: user.id,
        amount,
        isWithdrawal: true
      };
      
      const response = await generateQRCode(request);
      
      if (!response.success) {
        toast({
          title: "Échec de génération du QR code",
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
        success: false
      };
    } finally {
      setIsProcessingQRCode(false);
    }
  };

  return {
    isProcessingQRCode,
    generatePaymentQRCode,
    generateWithdrawalQRCode
  };
}
