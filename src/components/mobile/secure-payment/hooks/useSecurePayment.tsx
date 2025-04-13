
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts, SfdLoanPaymentParams } from '@/hooks/useSfdAccounts';
import { SfdClientAccount } from '@/hooks/sfd/types';

interface UseSecurePaymentProps {
  onBack?: () => void;
  isWithdrawal?: boolean;
  loanId?: string;
  onComplete?: () => void;
  selectedSfdId?: string;
}

export const useSecurePayment = ({
  onBack,
  isWithdrawal = false,
  loanId,
  onComplete,
  selectedSfdId
}: UseSecurePaymentProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { makeLoanPayment } = useSfdAccounts();
  const [transactionAmount, setTransactionAmount] = useState<number>(3500);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState<boolean>(false);
  const [qrDialogOpen, setQrDialogOpen] = useState<boolean>(false);
  const [insufficientBalance, setInsufficientBalance] = useState<boolean>(false);

  const handleBackAction = () => {
    if (paymentSuccess) {
      setPaymentSuccess(false);
    }
    onBack?.();
  };

  const handleAmountChange = (amount: number) => {
    setTransactionAmount(amount);
  };

  const handlePayment = useCallback(async () => {
    setPaymentStatus('pending');
    setProgress(30);

    try {
      // Simulate payment processing
      // Instead of using processPayment, we'll implement the logic directly here
      const paymentResult = await simulatePaymentProcessing(transactionAmount);

      if (paymentResult.success) {
        setProgress(100);
        setPaymentStatus('success');
        setPaymentSuccess(true);

        // If it's a loan payment, call the makeLoanPayment mutation
        if (loanId) {
          const paymentParams: SfdLoanPaymentParams = {
            loanId: loanId,
            amount: transactionAmount,
            paymentMethod: 'sfd_account',
            reference: `Payment for loan #${loanId}`
          };

          makeLoanPayment.mutate(paymentParams, {
            onSuccess: () => {
              toast({
                title: "Paiement effectué",
                description: `Paiement de ${transactionAmount} FCFA pour le prêt #${loanId}`,
              });
            },
            onError: (error: any) => {
              toast({
                title: "Erreur",
                description: error.message || "Une erreur est survenue lors du paiement du prêt",
                variant: "destructive",
              });
            }
          });
        }

        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Paiement échoué",
          description: "Votre paiement n'a pas pu être traité. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentStatus('failed');
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du paiement.",
        variant: "destructive",
      });
    } finally {
      setProgress(0);
    }
  }, [transactionAmount, loanId, makeLoanPayment, onComplete, toast]);

  // Helper function to simulate payment processing
  const simulatePaymentProcessing = async (amount: number): Promise<{success: boolean}> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 80% success rate for simulation purposes
    const isSuccess = Math.random() > 0.2;
    return { success: isSuccess };
  };

  const handleMobileMoneyPayment = () => {
    setMobileMoneyInitiated(true);
  };

  const handleScanQRCode = () => {
    setQrDialogOpen(true);
  };

  const detectInsufficientBalance = (selectedSfdAccount: SfdClientAccount | undefined | null) => {
    if (isWithdrawal && selectedSfdAccount) {
      setInsufficientBalance(selectedSfdAccount.balance < transactionAmount);
    } else {
      setInsufficientBalance(false);
    }
  };

  return {
    paymentSuccess,
    paymentStatus,
    progress,
    mobileMoneyInitiated,
    qrDialogOpen,
    transactionAmount,
    insufficientBalance,
    setMobileMoneyInitiated,
    setQrDialogOpen,
    handleBackAction,
    handlePayment,
    handleMobileMoneyPayment,
    handleScanQRCode,
    handleAmountChange,
    detectInsufficientBalance
  };
};
