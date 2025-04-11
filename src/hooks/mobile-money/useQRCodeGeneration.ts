
import { useState } from 'react';
import { useAuth } from '../useAuth';
import { generateQRCode } from '@/utils/api/qrCodeGenerator';
import { QRCodeGenerationHook } from './types';
import { QRCodeResponse } from '@/utils/mobileMoneyApi';

export function useQRCodeGeneration(): QRCodeGenerationHook {
  const [isProcessingQRCode, setIsProcessingQRCode] = useState(false);
  const { user } = useAuth();
  
  const generatePaymentQRCode = async (amount: number, loanId?: string): Promise<QRCodeResponse> => {
    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }
    
    setIsProcessingQRCode(true);
    
    try {
      const result = await generateQRCode({
        userId: user.id,
        sfdId: '', // We'll use an empty string by default, as it might be filled in by the backend
        amount,
        type: loanId ? 'loan_payment' : 'deposit',
        loanId,
        reference: loanId ? `loan-payment-${loanId}` : `payment-${Date.now()}`
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to generate payment QR code",
      };
    } finally {
      setIsProcessingQRCode(false);
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
    
    try {
      const result = await generateQRCode({
        userId: user.id,
        sfdId: '', // We'll use an empty string by default, as it might be filled in by the backend
        amount,
        type: 'withdrawal',
        reference: `withdrawal-${Date.now()}`
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to generate withdrawal QR code",
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
