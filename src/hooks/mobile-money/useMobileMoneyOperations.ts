
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mobileMoneyApi, MobileMoneyResponse } from '@/utils/mobileMoneyApi';

export interface MobileMoneyOperationsHook {
  processPayment: (phoneNumber: string, amount: number, provider: string, loanId?: string) => Promise<boolean>;
  processWithdrawal: (phoneNumber: string, amount: number, provider: string) => Promise<boolean>;
  isProcessingPayment: boolean;
  isProcessingWithdrawal: boolean;
  error: string | null;
  mobileMoneyProviders: { id: string; name: string; }[];
}

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Available mobile money providers
  const mobileMoneyProviders = [
    { id: 'orange', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Mobile Money' },
    { id: 'moov', name: 'Moov Money' }
  ];

  const processPayment = async (
    phoneNumber: string, 
    amount: number, 
    provider: string,
    loanId?: string
  ): Promise<boolean> => {
    setIsProcessingPayment(true);
    setError(null);
    
    try {
      // First check authorization if this is a loan payment
      if (loanId) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error('User not authenticated');
        }
        
        // Get active SFD
        const { data: sfdData } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', userData.user.id)
          .eq('is_default', true)
          .single();
          
        if (!sfdData) {
          throw new Error('No active SFD found');
        }
        
        // Authorize with the edge function
        const { data: authData, error: authError } = await supabase.functions.invoke('mobile-money-authorization', {
          body: {
            sfdId: sfdData.sfd_id,
            loanId,
            action: 'payment',
            amount
          }
        });
        
        if (authError || !authData?.authorized) {
          throw new Error(authData?.message || 'Payment not authorized by SFD');
        }
      }
      
      // If we got here, authorization passed or wasn't needed
      const response = await mobileMoneyApi.initiatePayment(phoneNumber, amount, provider);
      
      return response.success;
    } catch (err: any) {
      setError(err.message || 'An error occurred processing the payment');
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const processWithdrawal = async (
    phoneNumber: string, 
    amount: number, 
    provider: string
  ): Promise<boolean> => {
    setIsProcessingWithdrawal(true);
    setError(null);
    
    try {
      // For withdrawals, we always need authorization
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      // Get active SFD
      const { data: sfdData } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userData.user.id)
        .eq('is_default', true)
        .single();
        
      if (!sfdData) {
        throw new Error('No active SFD found');
      }
      
      // Authorize with the edge function
      const { data: authData, error: authError } = await supabase.functions.invoke('mobile-money-authorization', {
        body: {
          sfdId: sfdData.sfd_id,
          action: 'withdrawal',
          amount
        }
      });
      
      if (authError || !authData?.authorized) {
        throw new Error(authData?.message || 'Withdrawal not authorized by SFD');
      }
      
      // If we got here, authorization passed
      const response = await mobileMoneyApi.initiateWithdrawal(phoneNumber, amount, provider);
      
      return response.success;
    } catch (err: any) {
      setError(err.message || 'An error occurred processing the withdrawal');
      return false;
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  return {
    processPayment,
    processWithdrawal,
    isProcessingPayment,
    isProcessingWithdrawal,
    error,
    mobileMoneyProviders
  };
}
