
import { supabase } from '@/integrations/supabase/client';
import { QRCodeRequest, QRCodeResponse } from '@/utils/mobileMoneyApi';

/**
 * Génère un QR code pour un paiement ou un retrait
 * Note: Cette fonction ne sera utilisée que par l'admin SFD
 */
export const generateQRCode = async (request: QRCodeRequest): Promise<QRCodeResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('qr-code-verification', {
      body: JSON.stringify({
        userId: request.userId,
        loanId: request.loanId || ('LOAN-' + Math.random().toString(36).substr(2, 9)),
        amount: request.amount,
        isWithdrawal: request.isWithdrawal
      }),
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
      qrCodeData: data.qrCodeData || `data:image/svg+xml;base64,${btoa(JSON.stringify({
        code: data.code,
        userId: request.userId,
        amount: request.amount,
        isWithdrawal: request.isWithdrawal,
        timestamp: Date.now(),
        expiresAt: data.expiresAt
      }))}`,
      referenceId: data.code,
      expiresAt: data.expiresAt
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
 * Cette fonction est utilisée par l'application mobile pour vérifier un code QR scanné
 */
export const verifyQRCode = async (code: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('qr-code-verification', {
      body: JSON.stringify({ code })
    });
    
    if (error || !data?.success) {
      console.error('QR code verification error:', error || 'Invalid server response');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('QR code verification error:', error);
    return false;
  }
};

/**
 * Scanne un QR code pour un retrait ou un paiement en agence
 * Cette fonction est utilisée par l'application mobile pour effectuer un retrait/paiement après avoir scanné un code QR
 */
export const scanQRCodeForTransaction = async (code: string, userId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('qr-code-verification', {
      body: JSON.stringify({ 
        code,
        userId,
        action: 'scan'
      })
    });
    
    if (error) {
      console.error('QR code scan error:', error);
      return {
        success: false,
        message: error.message || 'Échec lors du scan du code QR'
      };
    }
    
    if (!data || !data.success) {
      return {
        success: false,
        message: data?.message || 'Code QR invalide ou expiré'
      };
    }
    
    return {
      success: true,
      message: data.isWithdrawal 
        ? 'Retrait en espèces confirmé' 
        : 'Paiement en espèces confirmé',
      data: data
    };
  } catch (error: any) {
    console.error('QR code scan error:', error);
    return {
      success: false,
      message: error.message || 'Une erreur est survenue lors du traitement'
    };
  }
};
