
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeResponse } from '@/utils/mobileMoneyApi';

export interface QRCodeGenerationHook {
  generateQRCode: (amount: number, type: 'deposit' | 'withdrawal' | 'loan_payment') => Promise<QRCodeResponse>;
  qrCodeData: string | null;
  isGenerating: boolean;
  error: string | null;
  transactionId: string | null;
  expiresAt: string | null;
}

export function useQRCodeGeneration(): QRCodeGenerationHook {
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);
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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: {
          userId: userData.user.id,
          amount,
          type,
          loanId
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        setQRCodeData(data.qrData);
        setTransactionId(data.transactionId);
        setExpiresAt(data.expiresAt);
        
        return {
          success: true,
          qrCodeData: data.qrData,
          transactionId: data.transactionId,
          expiration: data.expiresAt
        };
      } else {
        throw new Error(data?.error || 'Failed to generate QR code');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred generating the QR code');
      return {
        success: false,
        error: err.message || 'Failed to generate QR code'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateQRCode,
    qrCodeData,
    isGenerating,
    error,
    transactionId,
    expiresAt
  };
}
