
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { PaymentMethodTabs } from './PaymentMethodTabs';
import { SecurityFeatures } from './SecurityFeatures';
import { ReconciliationSection } from './ReconciliationSection';
import TabHeader from './TabHeader';
import PaymentDetails from './PaymentDetails';
import SuccessView from './SuccessView';
import MobileMoneyModal from '../loan/MobileMoneyModal';
import QRCodePaymentDialog from '../loan/QRCodePaymentDialog';
import { useMobileMoneyOperations } from '@/hooks/useMobileMoneyOperations';
import { useTransactions } from '@/hooks/useTransactions';

export interface SecurePaymentTabProps {
  onBack?: () => void;
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
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const { synchronizeWithSfd } = useRealtimeSynchronization();
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Définir les montants de transaction par défaut
  const amount = isWithdrawal ? 25000 : loanId ? 3500 : 10000;
  
  // Récupérer les paramètres passés via le state de navigation si disponibles
  useEffect(() => {
    if (location.state) {
      const { isRepayment, isWithdrawalParam, loanIdParam } = location.state as any;
      if (isRepayment !== undefined) {
        // Si c'est spécifié dans le state, utiliser cette valeur
        // Sinon, garder la valeur des props
      }
    }
  }, [location]);
  
  const { 
    makeDeposit, 
    makeWithdrawal,
    makeLoanRepayment
  } = useTransactions(user?.id, activeSfdId);
  
  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  // Synchroniser les données au chargement
  useEffect(() => {
    if (activeSfdId) {
      synchronizeWithSfd().catch(err => {
        console.error('Error synchronizing with SFD:', err);
      });
    }
  }, [activeSfdId, synchronizeWithSfd]);
  
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
    
    if (paymentMethod === 'sfd') {
      setQrDialogOpen(true);
      return;
    } else if (paymentMethod === 'mobile') {
      setMobileMoneyInitiated(true);
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
        // Synchroniser avec la SFD après l'opération
        try {
          await synchronizeWithSfd();
        } catch (syncError) {
          console.error('Error synchronizing after payment:', syncError);
        }
        
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
  
  const handleSuccessfulPayment = async () => {
    setPaymentSuccess(true);
    
    // Synchroniser avec la SFD après l'opération
    if (activeSfdId) {
      try {
        await synchronizeWithSfd();
      } catch (syncError) {
        console.error('Error synchronizing after successful payment:', syncError);
      }
    }
    
    if (onComplete) {
      onComplete();
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

  return (
    <div className="bg-white h-full pb-24">
      <TabHeader onBack={handleBackAction} isWithdrawal={isWithdrawal} />
      
      {paymentSuccess ? (
        <SuccessView 
          isWithdrawal={isWithdrawal} 
          amount={amount} 
          onBack={handleBackAction} 
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
        <MobileMoneyModal 
          onClose={() => setMobileMoneyInitiated(false)}
          isWithdrawal={isWithdrawal}
          amount={amount}
          onSuccess={handleSuccessfulPayment}
        />
      )}
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogTrigger className="hidden">Open QR Dialog</DialogTrigger>
        <QRCodePaymentDialog 
          onClose={() => setQrDialogOpen(false)} 
          amount={amount} 
          isWithdrawal={isWithdrawal}
          onSuccess={handleSuccessfulPayment}
        />
      </Dialog>
    </div>
  );
};

export default SecurePaymentTab;
