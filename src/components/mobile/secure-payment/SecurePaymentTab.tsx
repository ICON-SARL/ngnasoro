
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QrCodeIcon, Scan } from 'lucide-react';
import { PaymentMethodTabs } from './PaymentMethodTabs';
import { SecurityFeatures } from './SecurityFeatures';
import { ReconciliationSection } from './ReconciliationSection';
import TabHeader from './TabHeader';
import PaymentDetails from './PaymentDetails';
import SuccessView from './SuccessView';
import MobileMoneyModal from '../loan/MobileMoneyModal';
import QRCodePaymentDialog from '../loan/QRCodePaymentDialog';
import { usePaymentProcessor } from './hooks/usePaymentProcessor';
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
  
  // Gérer le paiement en fonction du type d'opération
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
    
    // Pour les opérations en agence SFD, ouvrir le scanner de QR code
    if (paymentMethod === 'sfd') {
      setQrDialogOpen(true);
      return;
    }
    
    // Pour les autres méthodes comme Mobile Money
    setPaymentStatus('pending');
    setProgress(10);
    
    setTimeout(() => setProgress(30), 500);
    setTimeout(() => setProgress(60), 1000);
    
    try {
      let result;
      
      if (isWithdrawal) {
        // Cas d'un retrait
        result = await makeWithdrawal(transactionAmount, `Retrait via ${paymentMethod}`);
      } else if (loanId) {
        // Cas d'un remboursement de prêt
        result = await makeLoanRepayment(loanId, transactionAmount, `Remboursement de prêt via ${paymentMethod}`);
      } else {
        // Cas d'un dépôt
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
  
  // Détecter automatiquement le solde suffisant
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
        <div className="p-4 space-y-6">
          <PaymentDetails 
            isWithdrawal={isWithdrawal}
            amount={transactionAmount}
            progress={progress}
            paymentStatus={paymentStatus}
            selectedSfdAccount={selectedSfdAccount}
            onAmountChange={handleAmountChange}
          />
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <QrCodeIcon className="h-5 w-5" /> 
              {isWithdrawal ? 'Retrait en agence SFD' : 'Paiement en agence SFD'}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {isWithdrawal 
                ? "Scannez le code QR disponible en agence SFD pour effectuer votre retrait en espèces."
                : "Scannez le code QR disponible en agence SFD pour effectuer votre paiement en espèces."
              }
            </p>
            
            <Button 
              onClick={() => setQrDialogOpen(true)} 
              className="w-full flex items-center justify-center gap-2"
            >
              <Scan className="h-4 w-4" />
              Scanner le code QR
            </Button>
          </div>
          
          <SecurityFeatures isWithdrawal={isWithdrawal} />
          
          {!isWithdrawal && !loanId && <ReconciliationSection />}
        </div>
      )}
      
      {mobileMoneyInitiated && (
        <MobileMoneyModal onClose={() => setMobileMoneyInitiated(false)} isWithdrawal={isWithdrawal} />
      )}
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogTrigger className="hidden">Open QR Dialog</DialogTrigger>
        <QRCodePaymentDialog onClose={() => setQrDialogOpen(false)} isWithdrawal={isWithdrawal} />
      </Dialog>
    </div>
  );
};

export default SecurePaymentTab;
