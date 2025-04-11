
// QR Code Generator API utility
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a QR code for payment or withdrawal
 */
export async function generateQRCode(
  userId: string,
  amount: number,
  isWithdrawal: boolean = false
): Promise<string | null> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
      body: {
        action: 'qrCode',
        userId,
        amount,
        isWithdrawal
      }
    });
    
    if (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
    
    if (!data?.success || !data?.qrCode) {
      throw new Error('Failed to generate QR code');
    }
    
    // In a real implementation, you would generate an actual QR code image data
    // For demo purposes, we'll use a placeholder or the data returned from the function
    
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEU...`;
  } catch (error) {
    console.error('QR code generation error:', error);
    return null;
  }
}

/**
 * Scan a QR code to process a transaction
 */
export async function scanQRCodeForTransaction(
  qrCode: string,
  amount: number,
  isWithdrawal: boolean = false,
  loanId?: string
): Promise<{ success: boolean; message: string; transactionId?: string }> {
  try {
    // In a real implementation, you would parse the QR code and send to the server
    
    const { data, error } = await supabase.functions.invoke('process-qr-transaction', {
      body: {
        qrCode,
        amount,
        isWithdrawal,
        loanId,
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
      message: isWithdrawal ? 'Retrait effectué avec succès' : 'Paiement effectué avec succès',
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
