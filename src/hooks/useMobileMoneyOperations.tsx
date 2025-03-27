
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateMobileMoneyTransaction, 
  generateQRCode,
  MobileMoneyRequest,
  QRCodeRequest,
  MobileMoneyResponse,
  QRCodeResponse
} from '@/utils/mobileMoneyApi';

interface MobileMoneyOperationsHook {
  isProcessing: boolean;
  processMobileMoneyPayment: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ) => Promise<MobileMoneyResponse>;
  processMobileMoneyWithdrawal: (
    phoneNumber: string, 
    amount: number, 
    provider: "orange" | "mtn" | "wave"
  ) => Promise<MobileMoneyResponse>;
  generatePaymentQRCode: (amount: number) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    setIsProcessing(true);
    
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
          description: "Vérifiez votre téléphone pour confirmer la transaction",
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
      setIsProcessing(false);
    }
  };
  
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
    
    setIsProcessing(true);
    
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
      setIsProcessing(false);
    }
  };
  
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
    
    setIsProcessing(true);
    
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
      setIsProcessing(false);
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
    
    setIsProcessing(true);
    
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
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processMobileMoneyPayment,
    processMobileMoneyWithdrawal,
    generatePaymentQRCode,
    generateWithdrawalQRCode
  };
}
