
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface PaymentProcessorProps {
  paymentMethod: string;
  setQrDialogOpen: (open: boolean) => void;
  setPaymentStatus: (status: 'pending' | 'success' | 'failed' | null) => void;
  setProgress: (progress: number) => void;
  toast: any;
  user: User | null;
  setPaymentSuccess: (success: boolean) => void;
  isWithdrawal?: boolean;
  loanId?: string;
}

export const usePaymentProcessor = ({
  paymentMethod,
  setQrDialogOpen,
  setPaymentStatus,
  setProgress,
  toast,
  user,
  setPaymentSuccess,
  isWithdrawal = false,
  loanId
}: PaymentProcessorProps) => {
  
  const validateRepayment = (amount: number, method: string) => {
    if (!amount || amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return false;
    }
    
    if (!method) {
      toast({
        title: "Méthode de paiement requise",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handlePayment = async () => {
    if (paymentMethod === 'sfd' && Math.random() > 0.5) {
      // Simulate QR code payment
      setQrDialogOpen(true);
      return;
    }
    
    const amount = isWithdrawal ? 25000 : 3500;
    const method = paymentMethod === 'mobile' ? 'mobile_money' : 'agency_qr';
    
    // Validate repayment data
    if (!isWithdrawal && !validateRepayment(amount, method)) {
      return;
    }
    
    setPaymentStatus('pending');
    setProgress(0);
    
    // Simulate payment processing with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      if (!isWithdrawal && loanId) {
        // Process loan repayment
        const { data, error } = await supabase.functions.invoke('process-repayment', {
          body: {
            loan_id: loanId || 'LOAN123',
            amount: amount,
            method: method
          }
        });
        
        if (error) throw error;
        
        // Add transaction record if payment successful
        if (data?.success && user) {
          const { error: txError } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              name: isWithdrawal ? 'Retrait de fonds' : 'Remboursement de prêt',
              type: isWithdrawal ? 'withdrawal' : 'repayment',
              amount: isWithdrawal ? -amount : -amount,
              date: new Date().toISOString()
            });
          
          if (txError) console.error('Transaction record error:', txError);
        }
      }
      
      // Simulating API response time
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        
        const success = Math.random() > 0.2;
        
        if (success) {
          setPaymentStatus('success');
          setPaymentSuccess(true);
          toast({
            title: isWithdrawal ? "Retrait réussi" : "Remboursement réussi",
            description: isWithdrawal 
              ? "Votre retrait a été traité avec succès." 
              : "Votre remboursement de prêt a été traité avec succès.",
            variant: "default",
          });
        } else {
          setPaymentStatus('failed');
          toast({
            title: isWithdrawal ? "Échec du retrait" : "Échec du remboursement",
            description: "Veuillez réessayer ou sélectionner une autre méthode.",
            variant: "destructive",
          });
        }
      }, 2000);
    } catch (error: any) {
      clearInterval(interval);
      setPaymentStatus('failed');
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement",
        variant: "destructive",
      });
    }
  };
  
  return {
    handlePayment,
    validateRepayment
  };
};
