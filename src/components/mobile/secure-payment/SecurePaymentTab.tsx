
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import TabHeader from './TabHeader';
import SuccessView from './SuccessView';
import SecurePaymentContent from './SecurePaymentContent';
import MobileMoneyModal from '../loan/MobileMoneyModal';
import QRCodePaymentDialog from '../loan/QRCodePaymentDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

export interface SecurePaymentTabProps {
  onBack?: () => void;
  isWithdrawal?: boolean;
  loanId?: string;
  onComplete?: () => void;
  selectedSfdId?: string;
}

const SecurePaymentTab: React.FC<SecurePaymentTabProps> = ({ 
  onBack, 
  isWithdrawal = false, 
  loanId,
  onComplete,
  selectedSfdId
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const { sfdAccounts, isLoading: accountsLoading } = useSfdAccounts();
  const [transactionAmount, setTransactionAmount] = useState(isWithdrawal ? 25000 : loanId ? 3500 : 10000);
  
  // Use the explicitly passed selectedSfdId or fall back to activeSfdId
  const effectiveSfdId = selectedSfdId || activeSfdId;
  
  // Get selected SFD account details
  const selectedSfdAccount = sfdAccounts.find(acc => acc.id === effectiveSfdId);
  
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
  
  // Handle payment based on the operation type
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
    
    // For SFD in-agency operations, open the QR code scanner
    if (paymentMethod === 'sfd') {
      setQrDialogOpen(true);
      return;
    }
    
    // For other methods like Mobile Money
    setPaymentStatus('pending');
    setProgress(10);
    
    setTimeout(() => setProgress(30), 500);
    setTimeout(() => setProgress(60), 1000);
    
    try {
      let result;
      
      if (isWithdrawal) {
        // Withdrawal case
        result = await makeWithdrawal(transactionAmount, `Retrait via ${paymentMethod}`);
      } else if (loanId) {
        // Loan repayment case
        result = await makeLoanRepayment(loanId, transactionAmount, `Remboursement de prêt via ${paymentMethod}`);
      } else {
        // Deposit case
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
  
  // Automatically detect sufficient balance
  useEffect(() => {
    const detectPrimaryAccount = () => {
      if (selectedSfdAccount && isWithdrawal) {
        // Check if the selected account has enough balance
        const hasEnoughBalance = selectedSfdAccount.balance >= transactionAmount;
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
    
    detectPrimaryAccount();
  }, [toast, isWithdrawal, selectedSfdAccount, transactionAmount]);
  
  const handleMobileMoneyPayment = () => {
    setMobileMoneyInitiated(true);
  };
  
  const handleAmountChange = (amount: number) => {
    setTransactionAmount(amount);
  };
  
  return (
    <div className="bg-white h-full pb-24">
      <TabHeader onBack={handleBackAction} isWithdrawal={isWithdrawal} />
      
      {paymentSuccess ? (
        <SuccessView 
          isWithdrawal={isWithdrawal} 
          amount={transactionAmount} 
          onBack={handleBackAction} 
        />
      ) : (
        <SecurePaymentContent
          isWithdrawal={isWithdrawal}
          loanId={loanId}
          transactionAmount={transactionAmount}
          progress={progress}
          paymentStatus={paymentStatus}
          selectedSfdAccount={selectedSfdAccount}
          onAmountChange={handleAmountChange}
          onScanQRCode={() => setQrDialogOpen(true)}
        />
      )}
      
      {mobileMoneyInitiated && (
        <MobileMoneyModal onClose={() => setMobileMoneyInitiated(false)} isWithdrawal={isWithdrawal} />
      )}
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <QRCodePaymentDialog onClose={() => setQrDialogOpen(false)} isWithdrawal={isWithdrawal} />
      </Dialog>
    </div>
  );
};

export default SecurePaymentTab;
