
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MobileMoneyOperationsHook } from './types';
import { useQRCodeGeneration } from './useQRCodeGeneration';
import { useMobileMoneyPayment } from './useMobileMoneyPayment';
import { useMobileMoneyWithdrawal } from './useMobileMoneyWithdrawal';

export function useMobileMoneyOperations(): MobileMoneyOperationsHook {
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  
  // Use existing hooks
  const {
    qrCodeData,
    isGenerating: isGeneratingQRCode,
    generateQRCode,
    resetQRCode,
    error: qrCodeError
  } = useQRCodeGeneration();
  
  const {
    isProcessing: isProcessingPayment,
    processPayment: processRawPayment,
    error: paymentError
  } = useMobileMoneyPayment();
  
  const {
    isProcessing: isProcessingWithdrawal,
    processWithdrawal: processRawWithdrawal,
    error: withdrawalError
  } = useMobileMoneyWithdrawal();

  // Define mobile money providers
  const mobileMoneyProviders = [
    { id: 'orange', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Money' },
    { id: 'moov', name: 'Moov Money' }
  ];

  // Fix the error by using useEffect instead of useState for error handling
  useEffect(() => {
    if (qrCodeError) setError(qrCodeError);
    else if (paymentError) setError(paymentError);
    else if (withdrawalError) setError(withdrawalError);
    else setError(null);
  }, [qrCodeError, paymentError, withdrawalError]);

  // Enhanced payment function that can handle loan repayments
  const processPayment = async (
    phoneNumber: string,
    amount: number,
    provider: string,
    loanId?: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette opération",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Process the mobile money payment
      const paymentSuccess = await processRawPayment(phoneNumber, amount, provider);
      
      if (paymentSuccess && loanId) {
        // If payment successful and it's a loan repayment, register the payment
        try {
          const { error: repaymentError } = await supabase.functions.invoke('process-repayment', {
            body: {
              userId: user.id,
              loanId: loanId,
              amount: amount,
              paymentMethod: 'mobile_money'
            }
          });
          
          if (repaymentError) throw repaymentError;
          
          toast({
            title: "Remboursement enregistré",
            description: "Votre remboursement a été enregistré avec succès",
          });
        } catch (error: any) {
          console.error('Error registering loan repayment:', error);
          toast({
            title: "Paiement effectué mais erreur d'enregistrement",
            description: "Le paiement a été effectué mais une erreur est survenue lors de l'enregistrement du remboursement",
            variant: "destructive",
          });
        }
      }
      
      return paymentSuccess;
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors du traitement du paiement");
      return false;
    }
  };

  // Enhanced withdrawal function with additional logging
  const processWithdrawal = async (
    phoneNumber: string,
    amount: number,
    provider: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette opération",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Process the withdrawal through mobile money
      const success = await processRawWithdrawal(phoneNumber, amount, provider);
      
      if (success) {
        // Log the withdrawal in our system
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: -amount, // Negative amount for withdrawals
          status: 'success',
          payment_method: 'mobile_money',
          description: `Retrait via ${provider}`,
          name: 'Retrait Mobile Money'
        });
      }
      
      return success;
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors du traitement du retrait");
      return false;
    }
  };

  // Combined isProcessing property
  const isProcessing = isProcessingPayment || isProcessingWithdrawal;

  return {
    isProcessingPayment,
    isProcessingWithdrawal,
    error,
    processPayment,
    processWithdrawal,
    qrCodeData,
    isGeneratingQRCode,
    generateQRCode,
    resetQRCode,
    mobileMoneyProviders,
    isProcessing
  };
}
