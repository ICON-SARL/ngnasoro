
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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

interface SecurePaymentTabProps {
  onBack: () => void;
  isWithdrawal?: boolean;
  loanId?: string;
  onComplete?: () => void;
}

const SecurePaymentTab: React.FC<SecurePaymentTabProps> = ({ 
  onBack, 
  isWithdrawal = false, 
  loanId,
  onComplete
}) => {
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  const { 
    makeDeposit, 
    makeWithdrawal,
    makeLoanRepayment
  } = useTransactions(user?.id, activeSfdId);
  
  // Définir les montants de transaction par défaut
  const amount = isWithdrawal ? 25000 : loanId ? 3500 : 10000;
  
  // Gérer le paiement en fonction du type d'opération
  const handlePayment = async () => {
    if (!user || !activeSfdId) {
      toast({
        title: "Erreur",
        description: "Utilisateur ou SFD non défini",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentStatus('pending');
    setProgress(10);
    
    setTimeout(() => setProgress(30), 500);
    setTimeout(() => setProgress(60), 1000);
    
    try {
      let result;
      
      if (isWithdrawal) {
        // Cas d'un retrait
        result = await makeWithdrawal(amount, `Retrait via ${paymentMethod}`);
      } else if (loanId) {
        // Cas d'un remboursement de prêt
        result = await makeLoanRepayment(loanId, amount, `Remboursement de prêt via ${paymentMethod}`);
      } else {
        // Cas d'un dépôt
        result = await makeDeposit(amount, `Dépôt via ${paymentMethod}`);
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
      // Simuler une vérification de solde
      const randomBalance = Math.random();
      if (isWithdrawal && randomBalance < 0.3) {
        setBalanceStatus('insufficient');
        setPaymentMethod('mobile');
        toast({
          title: "Solde SFD insuffisant",
          description: "Basculement automatique vers Mobile Money",
          variant: "default",
        });
      } else {
        setBalanceStatus('sufficient');
        setPaymentMethod('sfd');
      }
    };
    
    detectPrimaryAccount();
  }, [toast, isWithdrawal]);
  
  const handleMobileMoneyPayment = () => {
    setMobileMoneyInitiated(true);
  };
  
  return (
    <div className="bg-white h-full pb-24">
      <TabHeader onBack={onBack} isWithdrawal={isWithdrawal} />
      
      {paymentSuccess ? (
        <SuccessView 
          isWithdrawal={isWithdrawal} 
          amount={amount} 
          onBack={onBack} 
        />
      ) : (
        <div className="p-4 space-y-6">
          <PaymentDetails 
            isWithdrawal={isWithdrawal}
            amount={amount}
            progress={progress}
            paymentStatus={paymentStatus}
          />
          
          <PaymentMethodTabs 
            paymentMethod={paymentMethod}
            balanceStatus={balanceStatus}
            paymentStatus={paymentStatus}
            onPaymentMethodChange={setPaymentMethod}
            handlePayment={handlePayment}
            isWithdrawal={isWithdrawal}
          />
          
          <SecurityFeatures isWithdrawal={isWithdrawal} />
          
          {!isWithdrawal && !loanId && <ReconciliationSection />}
        </div>
      )}
      
      {mobileMoneyInitiated && (
        <MobileMoneyModal onClose={() => setMobileMoneyInitiated(false)} isWithdrawal={isWithdrawal} />
      )}
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogTrigger className="hidden">Open QR Dialog</DialogTrigger>
        <QRCodePaymentDialog onClose={() => setQrDialogOpen(false)} amount={amount} isWithdrawal={isWithdrawal} />
      </Dialog>
    </div>
  );
};

export default SecurePaymentTab;
