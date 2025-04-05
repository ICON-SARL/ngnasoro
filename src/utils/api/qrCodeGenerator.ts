
import { supabase } from '@/integrations/supabase/client';
import { QRCodeRequest, QRCodeResponse } from '@/utils/mobileMoneyApi';

/**
 * Génère un QR code pour un paiement ou un retrait
 */
export const generateQRCode = async (request: QRCodeRequest): Promise<QRCodeResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('qr-code-verification', {
      body: JSON.stringify({
        userId: request.userId,
        loanId: 'LOAN-' + Math.random().toString(36).substr(2, 9),
        amount: request.amount
      }),
      path: '/generate'
    });
    
    if (error) {
      console.error('Error generating QR code:', error);
      return { 
        success: false, 
        error: 'Échec de génération du code QR' 
      };
    }
    
    if (!data || !data.success) {
      return { 
        success: false, 
        error: 'Réponse invalide du serveur' 
      };
    }
    
    // Format the QR code data for the frontend
    return {
      success: true,
      qrCode: {
        userId: request.userId,
        amount: request.amount,
        isWithdrawal: request.isWithdrawal,
        timestamp: Date.now(),
        expiresAt: data.expiresAt,
        code: data.code
      }
    };
  } catch (error: any) {
    console.error('QR code generation error:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la génération du code QR'
    };
  }
};

/**
 * Vérifie un QR code
 */
export const verifyQRCode = async (code: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('qr-code-verification', {
      body: JSON.stringify({ code })
    });
    
    if (error || !data?.success) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('QR code verification error:', error);
    return false;
  }
};
