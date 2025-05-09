import { supabase } from '@/integrations/supabase/client';

// Define response types locally to fix the import issues
interface MobileMoneyResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

interface QRCodeResponse {
  success: boolean;
  qrCodeData?: string;
  transactionId?: string;
  expiration?: string;
  error?: string;
}

export const mobileMoneyApi = {
  async initiatePayment(
    phoneNumber: string, 
    amount: number, 
    provider: string,
    loanId?: string
  ): Promise<MobileMoneyResponse> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('mobile-money-payment', {
        body: {
          action: 'payment',
          phoneNumber,
          amount,
          provider,
          userId: userData.user.id,
          loanId
        }
      });
      
      if (error) throw error;
      
      return {
        success: data.success,
        transactionId: data.transactionId,
        message: data.message
      };
    } catch (error: any) {
      console.error('Mobile money payment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process mobile money payment'
      };
    }
  },
  
  async initiateWithdrawal(
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<MobileMoneyResponse> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('mobile-money-payment', {
        body: {
          action: 'withdrawal',
          phoneNumber,
          amount,
          provider,
          userId: userData.user.id
        }
      });
      
      if (error) throw error;
      
      return {
        success: data.success,
        transactionId: data.transactionId,
        message: data.message
      };
    } catch (error: any) {
      console.error('Mobile money withdrawal error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process mobile money withdrawal'
      };
    }
  }
};

export const qrCodeApi = {
  async generateQRCode(
    amount: number,
    isWithdrawal: boolean,
    loanId?: string
  ): Promise<QRCodeResponse> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('qr-code-verification', {
        body: {
          userId: userData.user.id,
          amount,
          isWithdrawal,
          loanId
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        return {
          success: true,
          qrCodeData: data.code,
          transactionId: data.id,
          expiration: data.expiresAt
        };
      } else {
        throw new Error(data.error || 'Failed to generate QR code');
      }
    } catch (error: any) {
      console.error('QR code generation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate QR code'
      };
    }
  },
  
  async verifyQRCode(code: string): Promise<QRCodeResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('qr-code-verification', {
        body: { code }
      });
      
      if (error) throw error;
      
      return {
        success: data.success,
        qrCodeData: data.qrData?.code,
        error: data.message && !data.success ? data.message : undefined
      };
    } catch (error: any) {
      console.error('QR code verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify QR code'
      };
    }
  },
  
  async scanQRCodeForTransaction(code: string, userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('qr-code-verification', {
        body: { 
          action: 'scan',
          code,
          userId 
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('QR code scanning error:', error);
      throw error;
    }
  }
};
