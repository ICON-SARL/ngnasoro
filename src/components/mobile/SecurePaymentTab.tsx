
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SecurePaymentHeader } from './secure-payment/SecurePaymentHeader';
import { InsufficientBalanceAlert } from './secure-payment/InsufficientBalanceAlert';
import { PaymentMethodTabs } from './secure-payment/PaymentMethodTabs';
import { SecurityFeatures } from './secure-payment/SecurityFeatures';
import { ReconciliationSection } from './secure-payment/ReconciliationSection';

interface SecurePaymentTabProps {
  onBack: () => void;
}

const SecurePaymentTab: React.FC<SecurePaymentTabProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  
  // Simulate automatic detection of the main SFD account
  useEffect(() => {
    const detectPrimaryAccount = () => {
      // Simulate an API check for balance
      const randomBalance = Math.random();
      if (randomBalance < 0.3) {
        setBalanceStatus('insufficient');
        setPaymentMethod('mobile');
        toast({
          title: "Compte SFD insuffisant",
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
  
  const handlePayment = () => {
    setPaymentStatus('pending');
    
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      if (success) {
        setPaymentStatus('success');
        toast({
          title: "Paiement réussi",
          description: "Transaction traitée avec succès et tokenisée.",
          variant: "default",
        });
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Échec du paiement",
          description: "Veuillez réessayer ou sélectionner une autre méthode.",
          variant: "destructive",
        });
      }
    }, 2000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 pb-24">
      <SecurePaymentHeader onBack={onBack} />
      
      <InsufficientBalanceAlert show={balanceStatus === 'insufficient'} />
      
      <PaymentMethodTabs 
        paymentMethod={paymentMethod}
        balanceStatus={balanceStatus}
        paymentStatus={paymentStatus}
        onPaymentMethodChange={setPaymentMethod}
        handlePayment={handlePayment}
      />
      
      <SecurityFeatures />
      
      <ReconciliationSection />
    </div>
  );
};

export default SecurePaymentTab;
