
import { useState } from 'react';
import { generateMobileMoneyQRCode } from '@/utils/mobileMoneyApi';
import { QRCodeGenerationHook, QRCodeResponse } from './types';

export function useQRCodeGeneration(): QRCodeGenerationHook {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const generateQRCode = async (
    amount: number, 
    type: 'deposit' | 'withdrawal' | 'loan_payment', 
    loanId?: string
  ): Promise<QRCodeResponse> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await generateMobileMoneyQRCode(amount, type, loanId);
      
      if (response.success && response.qrCodeData) {
        setQrCodeData(response.qrCodeData);
        setTransactionId(response.transactionId || null);
        setExpiresAt(response.expiration || null);
      } else {
        setError(response.error || 'Failed to generate QR code');
      }
      
      return response;
    } catch (err) {
      console.error('QR code generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    qrCodeData,
    isGenerating,
    error,
    transactionId,
    expiresAt,
    generateQRCode
  };
}
