
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

interface SecurePaymentTabProps {
  onBack: () => void;
  isWithdrawal?: boolean;
  loanId?: string;
}

const SecurePaymentTab: React.FC<SecurePaymentTabProps> = ({ 
  onBack, 
  isWithdrawal = false, 
  loanId 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Simulate automatic detection of the main SFD account
  useEffect(() => {
    const detectPrimaryAccount = () => {
      // Simulate an API check for balance
      const randomBalance = Math.random();
      if (randomBalance < 0.3) {
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
  }, [toast]);
  
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

  const handleMobileMoneyPayment = () => {
    setMobileMoneyInitiated(true);
  };
  
  const amount = isWithdrawal ? 25000 : 3500;
  
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
          
          {!isWithdrawal && <ReconciliationSection />}
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
