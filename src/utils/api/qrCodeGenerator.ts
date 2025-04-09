
import { apiClient } from '@/utils/apiClient';
import type { QRCodeRequest } from '@/hooks/sfd/types';
import type { QRCodeResponse } from '@/utils/mobileMoneyApi';

export async function generateQRCode(request: QRCodeRequest): Promise<QRCodeResponse> {
  try {
    // Call your edge function or API to generate the QR code
    const result = await apiClient.callEdgeFunction('generate-qr-code', request);
    
    if (!result || !result.success) {
      throw new Error(result?.error || 'Failed to generate QR code');
    }
    
    return {
      success: true,
      qrCodeData: result.qrCodeData,
      expiration: result.expiration,
      transactionId: result.transactionId
    };
  } catch (error: any) {
    console.error('QR code generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate QR code'
    };
  }
}

export async function scanQRCodeForTransaction(
  qrCode: string, 
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await apiClient.callEdgeFunction('scan-qr-code', {
      qrCode,
      userId
    });
    
    return {
      success: result.success,
      message: result.message || 'Transaction processed successfully'
    };
  } catch (error: any) {
    console.error('QR code scanning error:', error);
    return {
      success: false,
      message: error.message || 'Failed to process QR code'
    };
  }
}
