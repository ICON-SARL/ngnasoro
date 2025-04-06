
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
        amount,
        purpose: loanId ? 'loan_repayment' : 'payment',
        loanId,
        isWithdrawal: false
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
        amount,
        purpose: 'withdrawal',
        isWithdrawal: true
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
