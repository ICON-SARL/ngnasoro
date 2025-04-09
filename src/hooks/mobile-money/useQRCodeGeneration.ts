
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeGenerationHook, QRCodeResponse } from './types';

export function useQRCodeGeneration(): QRCodeGenerationHook {
  const [isProcessingQRCode, setIsProcessingQRCode] = useState(false);
  const { user } = useAuth();
  
  // Générer un QR code pour un paiement
  const generatePaymentQRCode = async (
    amount: number,
    loanId?: string
  ): Promise<QRCodeResponse> => {
    if (!user?.id) {
      return { 
        success: false,
        error: "Utilisateur non authentifié"
      };
    }
    
    setIsProcessingQRCode(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
        body: {
          action: 'qrCode',
          userId: user.id,
          amount,
          isWithdrawal: false,
          loanId
        }
      });
      
      if (error) throw error;
      
      return data as QRCodeResponse;
    } catch (error: any) {
      console.error('Erreur lors de la génération du QR code de paiement:', error);
      return {
        success: false,
        error: error.message || "Erreur lors de la génération du QR code"
      };
    } finally {
      setIsProcessingQRCode(false);
    }
  };
  
  // Générer un QR code pour un retrait
  const generateWithdrawalQRCode = async (
    amount: number
  ): Promise<QRCodeResponse> => {
    if (!user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié"
      };
    }
    
    setIsProcessingQRCode(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
        body: {
          action: 'qrCode',
          userId: user.id,
          amount,
          isWithdrawal: true
        }
      });
      
      if (error) throw error;
      
      return data as QRCodeResponse;
    } catch (error: any) {
      console.error('Erreur lors de la génération du QR code de retrait:', error);
      return {
        success: false,
        error: error.message || "Erreur lors de la génération du QR code"
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
