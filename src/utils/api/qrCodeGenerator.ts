
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

/**
 * Scan a QR code and process the transaction
 * @param code The QR code data to scan
 * @param userId The user ID making the request
 * @returns Result of the QR code scan operation
 */
export async function scanQRCodeForTransaction(code: string, userId: string): Promise<ScanQRCodeResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('qr-code-verification', {
      body: {
        action: 'scan',
        code,
        userId
      }
    });

    if (error) {
      console.error('Error scanning QR code:', error);
      return {
        success: false,
        message: error.message || 'Failed to scan QR code'
      };
    }

    return {
      success: data.success,
      message: data.message,
      transaction: data.transaction,
      isWithdrawal: data.isWithdrawal
    };
  } catch (error: any) {
    console.error('Error in scanQRCodeForTransaction:', error);
    return {
      success: false,
      message: error.message || 'Failed to process QR code'
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

export interface ScanQRCodeResponse {
  success: boolean;
  message: string;
  transaction?: any;
  isWithdrawal?: boolean;
}
