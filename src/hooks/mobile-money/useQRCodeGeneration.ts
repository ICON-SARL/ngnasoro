
import { useState } from 'react';
import { mobileMoneyApi, QRCodeResponse } from '@/utils/mobileMoneyApi';
import { QRCodeGenerationHook } from './types';

export function useQRCodeGeneration(): QRCodeGenerationHook {
  const [isProcessingQRCode, setIsProcessingQRCode] = useState(false);
  
  const generatePaymentQRCode = async (amount: number, loanId?: string): Promise<QRCodeResponse> => {
    setIsProcessingQRCode(true);
    try {
      const result = await mobileMoneyApi.generateQRCode(amount, 'payment');
      
      // Add loanId to qrCodeData if provided
      if (loanId && result.success) {
        const qrData = JSON.parse(atob(result.qrCodeData?.split(',')[1] || '{}'));
        qrData.loanId = loanId;
        result.qrCodeData = `data:image/svg+xml;base64,${btoa(JSON.stringify(qrData))}`;
      }
      
      return result;
    } catch (error) {
      console.error('Failed to generate payment QR code:', error);
      return {
        success: false,
        error: 'Failed to generate payment QR code'
      };
    } finally {
      setIsProcessingQRCode(false);
    }
  };
  
  const generateWithdrawalQRCode = async (amount: number): Promise<QRCodeResponse> => {
    setIsProcessingQRCode(true);
    try {
      const result = await mobileMoneyApi.generateQRCode(amount, 'withdrawal');
      return result;
    } catch (error) {
      console.error('Failed to generate withdrawal QR code:', error);
      return {
        success: false,
        error: 'Failed to generate withdrawal QR code'
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
