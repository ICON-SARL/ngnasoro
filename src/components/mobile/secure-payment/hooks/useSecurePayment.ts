
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { SfdAccount } from '@/hooks/sfd/types';

interface UseSecurePaymentProps {
  onBack?: () => void;
  isWithdrawal?: boolean;
  loanId?: string;
  onComplete?: () => void;
  selectedSfdId?: string;
}

export function useSecurePayment({ 
  onBack, 
  isWithdrawal = false, 
  loanId,
  onComplete,
  selectedSfdId 
}: UseSecurePaymentProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Set default transaction amount based on transaction type
  const [transactionAmount, setTransactionAmount] = useState(isWithdrawal ? 25000 : loanId ? 10000 : 5000);
  
  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  const handleAmountChange = (amount: number) => {
    setTransactionAmount(amount);
  };
  
  const detectInsufficientBalance = (account?: SfdAccount | null) => {
    if (!account) return;
    
    // Check if balance is sufficient for withdrawal
    if (isWithdrawal && account.balance < transactionAmount) {
      setBalanceStatus('insufficient');
      toast({
        title: "Solde insuffisant",
        description: "Votre solde est insuffisant pour ce retrait",
        variant: "destructive",
      });
    } else {
      setBalanceStatus('sufficient');
    }
  };

  const handlePayment = async () => {
    // Simulate QR code payment for SFD account method
    if (paymentMethod === 'sfd') {
      setQrDialogOpen(true);
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
      // Simulate API response time
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        
        const success = Math.random() > 0.2;
        
        if (success) {
          setPaymentStatus('success');
          setPaymentSuccess(true);
          toast({
            title: isWithdrawal ? "Retrait réussi" : "Paiement réussi",
            description: isWithdrawal 
              ? "Votre retrait a été traité avec succès." 
              : "Votre paiement a été traité avec succès.",
            variant: "default",
          });
          if (onComplete) {
            setTimeout(onComplete, 2000);
          }
        } else {
          setPaymentStatus('failed');
          toast({
            title: isWithdrawal ? "Échec du retrait" : "Échec du paiement",
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

  const handleMobileMoneyPayment = () => {
    setMobileMoneyInitiated(true);
  };
  
  const handleScanQRCode = () => {
    setQrDialogOpen(true);
  };
  
  return {
    paymentMethod,
    balanceStatus,
    paymentStatus,
    paymentSuccess,
    progress,
    mobileMoneyInitiated,
    qrDialogOpen,
    transactionAmount,
    setPaymentMethod,
    setMobileMoneyInitiated,
    setQrDialogOpen,
    handleBackAction,
    handlePayment,
    handleMobileMoneyPayment,
    handleScanQRCode,
    handleAmountChange,
    detectInsufficientBalance
  };
}
