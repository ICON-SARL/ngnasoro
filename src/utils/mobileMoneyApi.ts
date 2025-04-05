
import { supabase } from "@/integrations/supabase/client";

export interface MobileMoneyRequest {
  userId: string;
  phoneNumber: string;
  amount: number;
  provider: "orange" | "mtn" | "wave";
  isWithdrawal: boolean;
  loanId?: string;
  isRepayment?: boolean;
}

export interface QRCodeRequest {
  userId: string;
  amount: number;
  isWithdrawal: boolean;
  loanId?: string;
  isRepayment?: boolean;
}

export interface MobileMoneyResponse {
  success: boolean;
  message: string;
  transaction?: any;
  reference?: string;
  providerResponse?: {
    status: string;
    providerReference: string;
    estimatedCompletion: string;
  };
  error?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrCode?: {
    userId: string;
    amount: number;
    isWithdrawal: boolean;
    timestamp: number;
    expiresAt: string;
    code: string;
    loanId?: string;
  };
  error?: string;
}

/**
 * Initiates a mobile money transaction (payment or withdrawal)
 */
export async function initiateMobileMoneyTransaction(request: MobileMoneyRequest): Promise<MobileMoneyResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
      body: {
        action: 'mobileMoney',
        ...request
      }
    });
    
    if (error) {
      console.error('Mobile money transaction error:', error);
      return { 
        success: false, 
        message: "La transaction a échoué", 
        error: error.message 
      };
    }
    
    return data;
  } catch (error: any) {
    console.error('Mobile money API error:', error);
    return { 
      success: false, 
      message: "Une erreur s'est produite", 
      error: error.message 
    };
  }
}

/**
 * Initiates a loan repayment using mobile money
 */
export async function initiateLoanRepayment(
  userId: string,
  loanId: string,
  phoneNumber: string,
  amount: number,
  provider: "orange" | "mtn" | "wave"
): Promise<MobileMoneyResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
      body: {
        action: 'mobileMoney',
        userId,
        loanId,
        phoneNumber,
        amount,
        provider,
        isWithdrawal: false,
        isRepayment: true
      }
    });
    
    if (error) {
      console.error('Loan repayment error:', error);
      return { 
        success: false, 
        message: "Le remboursement a échoué", 
        error: error.message 
      };
    }
    
    return data;
  } catch (error: any) {
    console.error('Loan repayment API error:', error);
    return { 
      success: false, 
      message: "Une erreur s'est produite lors du remboursement", 
      error: error.message 
    };
  }
}

/**
 * Generates a QR code for in-agency payment or withdrawal
 */
export async function generateQRCode(request: QRCodeRequest): Promise<QRCodeResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
      body: {
        action: 'qrCode',
        ...request
      }
    });
    
    if (error) {
      console.error('QR code generation error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return data;
  } catch (error: any) {
    console.error('QR code API error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
