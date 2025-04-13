import { supabase } from '@/integrations/supabase/client';

interface QRCodeResponse {
  success: boolean;
  qrData?: string;
  transactionId?: string;
  message?: string;
}

interface ScanResponse {
  success: boolean;
  message: string;
  transaction?: any;
  isWithdrawal?: boolean;
}

// Generate a QR code for a transaction
export async function generateQRCode(
  amount: number,
  type: 'deposit' | 'withdrawal' | 'loan_payment' = 'deposit',
  userId: string,
  reference?: string,
  loanId?: string
): Promise<QRCodeResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-qr-code', {
      body: {
        userId,
        amount,
        type,
        reference,
        loanId
      }
    });
    
    if (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        message: error.message || "Impossible de générer le code QR"
      };
    }
    
    return {
      success: true,
      qrData: data.qrData,
      transactionId: data.transactionId
    };
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return {
      success: false,
      message: error.message || "Une erreur est survenue lors de la génération du code QR"
    };
  }
}

// Scan a QR code to process a transaction
export async function scanQRCodeForTransaction(
  code: string,
  userId: string
): Promise<ScanResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('qr-code-verification', {
      body: {
        action: 'scan',
        code,
        userId
      }
    });
    
    if (error || !data.success) {
      return {
        success: false,
        message: (error?.message || data?.message) || "Code QR invalide ou expiré"
      };
    }
    
    return {
      success: true,
      message: data.message || "Transaction traitée avec succès",
      transaction: data.transaction,
      isWithdrawal: data.isWithdrawal
    };
  } catch (error: any) {
    console.error('Error scanning QR code:', error);
    return {
      success: false,
      message: error.message || "Une erreur est survenue lors de l'analyse du code QR"
    };
  }
}

// Verify a QR code without processing a transaction
export async function verifyQRCode(code: string): Promise<{
  success: boolean;
  qrData?: any;
  message?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('qr-code-verification', {
      body: {
        code
      }
    });
    
    if (error) {
      return {
        success: false,
        message: error.message || "Impossible de vérifier le code QR"
      };
    }
    
    return {
      success: data.success,
      qrData: data.qrData,
      message: data.message
    };
  } catch (error: any) {
    console.error('Error verifying QR code:', error);
    return {
      success: false,
      message: error.message || "Une erreur est survenue lors de la vérification du code QR"
    };
  }
}
