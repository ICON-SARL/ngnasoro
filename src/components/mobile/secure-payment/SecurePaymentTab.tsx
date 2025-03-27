
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
  
  const { handlePayment, validateRepayment } = usePaymentProcessor({
    paymentMethod,
    setQrDialogOpen,
    setPaymentStatus,
    setProgress,
    toast,
    user,
    setPaymentSuccess,
    isWithdrawal,
    loanId
  });
  
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
