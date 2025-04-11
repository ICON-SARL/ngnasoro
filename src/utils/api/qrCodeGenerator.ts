
import { supabase } from "@/integrations/supabase/client";
import { QRCodeRequest } from "@/hooks/sfd/types";

/**
 * Generate a QR code for payments or withdrawals
 * @param params QR code generation parameters
 * @returns QR code data or error
 */
export async function generateQRCode(params: QRCodeRequest) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-qr-code', {
      body: JSON.stringify(params)
    });
    
    if (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate QR code',
      };
    }
    
    return {
      success: true,
      qrData: data.qrData,
      transactionId: data.transactionId,
      expiresAt: data.expiresAt,
    };
  } catch (error: any) {
    console.error('Error in generateQRCode:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate QR code',
    };
  }
}

export interface QRCodeResponse {
  success: boolean;
  qrData?: string;
  transactionId?: string;
  expiresAt?: string;
  error?: string;
}
