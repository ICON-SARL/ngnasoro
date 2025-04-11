
// QR Code Generator API utility
import { supabase } from '@/integrations/supabase/client';

export interface QRCodeResponse {
  success: boolean;
  qrData?: string;
  transactionId?: string;
  expiresAt?: string;
  error?: string;
}

export interface QRCodeRequest {
  userId: string;
  sfdId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'loan_payment';
  loanId?: string;
  reference?: string;
}

/**
 * Generate a QR code for payment or withdrawal
 */
export async function generateQRCode(
  params: QRCodeRequest
): Promise<QRCodeResponse> {
  try {
    if (!params.userId) {
      throw new Error('User ID is required');
    }
    
    const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
      body: {
        action: 'qrCode',
        userId: params.userId,
        amount: params.amount,
        isWithdrawal: params.type === 'withdrawal',
        sfdId: params.sfdId,
        loanId: params.loanId,
        reference: params.reference
      }
    });
    
    if (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
    
    if (!data?.success || !data?.qrCode) {
      throw new Error('Failed to generate QR code');
    }
    
    return {
      success: true,
      qrData: `data:image/png;base64,iVBORw0KGgoAAAANSUhEU...`,
      transactionId: data.qrCode.code,
      expiresAt: data.qrCode.expiresAt
    };
  } catch (error: any) {
    console.error('QR code generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate QR code'
    };
  }
}

/**
 * Scan a QR code to process a transaction
 */
export async function scanQRCodeForTransaction(
  qrCode: string,
  userId: string
): Promise<{ success: boolean; message: string; transactionId?: string }> {
  try {
    // In a real implementation, you would parse the QR code and send to the server
    
    const { data, error } = await supabase.functions.invoke('process-qr-transaction', {
      body: {
        qrCode,
        userId,
        timestamp: Date.now()
      }
    });
    
    if (error) {
      console.error('Error processing QR transaction:', error);
      throw error;
    }
    
    if (!data?.success) {
      throw new Error(data?.message || 'Transaction failed');
    }
    
    return {
      success: true,
      message: data.isWithdrawal ? 'Retrait effectué avec succès' : 'Paiement effectué avec succès',
      transactionId: data.transactionId
    };
  } catch (error: any) {
    console.error('QR transaction error:', error);
    return {
      success: false,
      message: error.message || 'Transaction failed'
    };
  }
}
