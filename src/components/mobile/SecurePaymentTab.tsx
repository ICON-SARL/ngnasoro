
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PaymentMethodTabs } from './secure-payment/PaymentMethodTabs';
import { SecurityFeatures } from './secure-payment/SecurityFeatures';
import { ReconciliationSection } from './secure-payment/ReconciliationSection';
import MobileMoneyModal from './loan/MobileMoneyModal';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import QRCodePaymentDialog from './loan/QRCodePaymentDialog';

interface SecurePaymentTabProps {
  onBack: () => void;
  isWithdrawal?: boolean;
}

const SecurePaymentTab: React.FC<SecurePaymentTabProps> = ({ onBack, isWithdrawal = false }) => {
  const { toast } = useToast();
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
  
  const handlePayment = () => {
    if (paymentMethod === 'sfd' && Math.random() > 0.5) {
      // Simulate QR code payment
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
    
    // Simulate payment processing
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
  };

  const handleMobileMoneyPayment = () => {
    setMobileMoneyInitiated(true);
  };
  
  const amount = isWithdrawal ? 25000 : 3500;
  
  return (
    <div className="bg-white h-full pb-24">
      <div className="p-4 flex items-center justify-between border-b">
        <Button variant="ghost" onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">
          {isWithdrawal ? "Retrait de fonds" : "Remboursement de prêt"}
        </h1>
        <div className="w-5"></div>
      </div>
      
      {paymentSuccess ? (
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {isWithdrawal ? "Retrait réussi" : "Remboursement réussi"}
          </h2>
          <p className="text-gray-600 mb-6">
            {isWithdrawal 
              ? `Votre retrait de ${amount.toLocaleString()} FCFA a été traité avec succès.` 
              : `Votre remboursement de ${amount.toLocaleString()} FCFA a été traité avec succès.`
            } Un reçu a été envoyé à votre adresse email.
          </p>
          <div className="w-full bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Référence:</span>
              <span className="font-medium">REF-23458976</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className="text-green-600 font-medium">Confirmé</span>
            </div>
          </div>
          <Button 
            className="w-full mb-3"
            onClick={onBack}
          >
            {isWithdrawal ? "Retour au tableau de bord" : "Retour aux détails du prêt"}
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => window.print()}
          >
            Télécharger le reçu
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-2">
            <h2 className="font-bold mb-1">
              {isWithdrawal ? "Détails du retrait" : "Détails du remboursement"}
            </h2>
            {isWithdrawal ? (
              <>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Compte:</span>
                  <span>SFD Bamako Principal</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Disponible:</span>
                  <span>198 500 FCFA</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Prêt:</span>
                  <span>Microfinance Bamako</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Échéance:</span>
                  <span>10 Juillet 2023</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>{isWithdrawal ? "Montant du retrait:" : "Montant dû:"}</span>
              <span>{amount.toLocaleString()} FCFA</span>
            </div>
          </div>
          
          {paymentStatus === 'pending' && (
            <div className="space-y-2 my-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-gray-600">
                {isWithdrawal 
                  ? "Traitement de votre retrait..." 
                  : "Traitement de votre remboursement..."
                }
              </p>
            </div>
          )}
          
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
