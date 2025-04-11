
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { generateQRCode as generateQRCodeAPI, QRCodeResponse, QRCodeRequest } from '@/utils/api/qrCodeGenerator';
import { QRCodeGenerationHook } from './types';

export function useQRCodeGeneration(): QRCodeGenerationHook {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingQRCode, setIsProcessingQRCode] = useState(false);
  const { user } = useAuth();
  
  const generateQRCode = async (amount: number, type: 'payment' | 'withdrawal'): Promise<boolean> => {
    if (type === 'payment') {
      const result = await generatePaymentQRCode(amount);
      return result.success;
    } else {
      const result = await generateWithdrawalQRCode(amount);
      return result.success;
    }
  };
  
  const generatePaymentQRCode = async (amount: number, loanId?: string): Promise<QRCodeResponse> => {
    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }
    
    setIsProcessingQRCode(true);
    setIsGenerating(true);
    setError(null);
    
    try {
      const request: QRCodeRequest = {
        userId: user.id,
        sfdId: '', // We'll use an empty string by default, as it might be filled in by the backend
        amount,
        type: loanId ? 'loan_payment' : 'deposit',
        loanId,
        reference: loanId ? `loan-payment-${loanId}` : `payment-${Date.now()}`
      };
      
      // Call the imported API function from qrCodeGenerator.ts
      const result = await generateQRCodeAPI(request);
      
      if (result.success && result.qrData) {
        setQrCodeData(result.qrData);
      }
      
      return result;
    } catch (error: any) {
      setError(error.message || "Failed to generate payment QR code");
      return {
        success: false,
        error: error.message || "Failed to generate payment QR code",
      };
    } finally {
      setIsProcessingQRCode(false);
      setIsGenerating(false);
    }
  };
  
  const generateWithdrawalQRCode = async (amount: number): Promise<QRCodeResponse> => {
    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }
    
    setIsProcessingQRCode(true);
    setIsGenerating(true);
    setError(null);
    
    try {
      const request: QRCodeRequest = {
        userId: user.id,
        sfdId: '', // We'll use an empty string by default, as it might be filled in by the backend
        amount,
        type: 'withdrawal',
        reference: `withdrawal-${Date.now()}`
      };
      
      // Call the imported API function from qrCodeGenerator.ts
      const result = await generateQRCodeAPI(request);
      
      if (result.success && result.qrData) {
        setQrCodeData(result.qrData);
      }
      
      return result;
    } catch (error: any) {
      setError(error.message || "Failed to generate withdrawal QR code");
      return {
        success: false,
        error: error.message || "Failed to generate withdrawal QR code",
      };
    } finally {
      setIsProcessingQRCode(false);
      setIsGenerating(false);
    }
  };
  
  return {
    isGenerating,
    qrCodeData,
    error,
    generateQRCode,
    isProcessingQRCode,
    generatePaymentQRCode,
    generateWithdrawalQRCode
  };
}
