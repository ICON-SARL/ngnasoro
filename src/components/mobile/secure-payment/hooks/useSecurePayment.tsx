
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { SfdAccount } from '@/hooks/useSfdAccounts';

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
  const { user, activeSfdId } = useAuth();
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Dialog state
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Amount state
  const [transactionAmount, setTransactionAmount] = useState(isWithdrawal ? 25000 : loanId ? 3500 : 10000);
  
  const effectiveSfdId = selectedSfdId || activeSfdId;
  
  const {
    makeDeposit, 
    makeWithdrawal, 
    makeLoanRepayment
  } = useTransactions(user?.id, effectiveSfdId);
  
  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  const handlePayment = async () => {
    if (!user || !effectiveSfdId) {
      toast({
        title: "Erreur",
        description: "Utilisateur ou SFD non défini",
        variant: "destructive",
      });
      return;
    }
    
    if (transactionAmount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentMethod === 'sfd') {
      setQrDialogOpen(true);
      return;
    }
    
    setPaymentStatus('pending');
    setProgress(10);
    
    setTimeout(() => setProgress(30), 500);
    setTimeout(() => setProgress(60), 1000);
    
    try {
      let result;
      
      if (isWithdrawal && makeWithdrawal) {
        result = await makeWithdrawal(transactionAmount, `Retrait via ${paymentMethod}`);
      } else if (loanId && makeLoanRepayment) {
        result = await makeLoanRepayment(loanId, transactionAmount, `Remboursement de prêt via ${paymentMethod}`);
      } else if (makeDeposit) {
        result = await makeDeposit(transactionAmount, `Dépôt via ${paymentMethod}`);
      }
      
      setTimeout(() => setProgress(100), 1500);
      
      if (result) {
        setTimeout(() => {
          setPaymentStatus('success');
          setPaymentSuccess(true);
          if (onComplete) {
            onComplete();
          }
        }, 2000);
      } else {
        setTimeout(() => {
          setPaymentStatus('failed');
          toast({
            title: "Erreur",
            description: "La transaction a échoué. Veuillez réessayer.",
            variant: "destructive",
          });
        }, 2000);
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      toast({
        title: "Erreur",
        description: error.message || "La transaction a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  
  const detectInsufficientBalance = (selectedAccount?: SfdAccount | null) => {
    if (selectedAccount && isWithdrawal) {
      const hasEnoughBalance = selectedAccount.balance >= transactionAmount;
      setBalanceStatus(hasEnoughBalance ? 'sufficient' : 'insufficient');
      if (!hasEnoughBalance) {
        setPaymentMethod('mobile');
        toast({
          title: "Solde SFD insuffisant",
          description: "Basculement automatique vers Mobile Money",
          variant: "default",
        });
      } else {
        setPaymentMethod('sfd');
      }
    } else {
      setBalanceStatus('sufficient');
      setPaymentMethod('sfd');
    }
  };
  
  const handleMobileMoneyPayment = () => {
    setMobileMoneyInitiated(true);
  };
  
  const handleScanQRCode = () => {
    setQrDialogOpen(true);
  };
  
  const handleAmountChange = (amount: number) => {
    setTransactionAmount(amount);
  };
  
  return {
    // State
    paymentMethod,
    balanceStatus,
    paymentStatus,
    paymentSuccess,
    progress,
    mobileMoneyInitiated,
    qrDialogOpen,
    transactionAmount,
    
    // Functions
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
