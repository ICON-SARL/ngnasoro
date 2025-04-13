
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Smartphone, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionOperations } from '@/hooks/transactions/useTransactionOperations';
import { MobileMoneyTab } from '@/components/mobile/secure-payment/MobileMoneyTab';
import QRCodeScannerDialog from '@/components/mobile/secure-payment/QRCodeScannerDialog';
import { useMobileMoneyOperations } from '@/hooks/mobile-money';

const MobileDepositPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { makeDeposit } = useTransactionOperations(user?.id);
  const { processPayment } = useMobileMoneyOperations();
  
  const [amount, setAmount] = useState(5000);
  const [depositMethod, setDepositMethod] = useState<'sfd' | 'mobile_money'>('sfd');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('orange');
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    } else {
      setAmount(0);
    }
  };
  
  const handlePayment = async () => {
    if (amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à 0",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentStatus('pending');
    
    try {
      if (depositMethod === 'mobile_money') {
        // Process mobile money payment
        const success = await processPayment(phoneNumber, amount, provider);
        
        if (success) {
          // Record the deposit
          await makeDeposit(amount, "Dépôt via Mobile Money", "mobile_money");
          
          setPaymentStatus('success');
          toast({
            title: "Dépôt réussi",
            description: `Votre dépôt de ${amount} FCFA a été enregistré.`,
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/mobile-flow/savings');
          }, 2000);
        } else {
          setPaymentStatus('failed');
          toast({
            title: "Échec du dépôt",
            description: "Veuillez réessayer ou contacter le support.",
            variant: "destructive",
          });
        }
      } else {
        // For SFD deposit, we'll open the QR scanner dialog
        setIsQRScannerOpen(true);
        setPaymentStatus(null);
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement",
        variant: "destructive",
      });
    }
  };
  
  const handleQRScanSuccess = async (transactionData: any) => {
    try {
      // Record the deposit
      await makeDeposit(amount, "Dépôt en agence SFD", "agency_qr");
      
      setPaymentStatus('success');
      toast({
        title: "Dépôt réussi",
        description: `Votre dépôt de ${amount} FCFA a été enregistré.`,
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/mobile-flow/savings');
      }, 2000);
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement du dépôt",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/savings')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Dépôt</h1>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Deposit amount section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Détails du dépôt</h2>
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium">
              Montant du dépôt
            </label>
            <div className="flex">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className="rounded-r-none"
              />
              <div className="bg-gray-100 px-3 flex items-center rounded-r-md border-y border-r">
                <span className="text-gray-500">FCFA</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment method selection */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={depositMethod === 'sfd' ? 'default' : 'outline'}
            className={`flex gap-2 ${depositMethod === 'sfd' ? 'bg-primary' : ''}`}
            onClick={() => setDepositMethod('sfd')}
          >
            <QrCode className="h-5 w-5" />
            <span>SFD</span>
          </Button>
          
          <Button
            variant={depositMethod === 'mobile_money' ? 'default' : 'outline'}
            className={`flex gap-2 ${depositMethod === 'mobile_money' ? 'bg-primary' : ''}`}
            onClick={() => setDepositMethod('mobile_money')}
          >
            <Smartphone className="h-5 w-5" />
            <span>Mobile Money</span>
          </Button>
        </div>
        
        {/* Payment method specific UI */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          {depositMethod === 'mobile_money' ? (
            <MobileMoneyTab 
              paymentStatus={paymentStatus}
              handlePayment={handlePayment}
              isWithdrawal={false}
            />
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Paiement en agence SFD</h3>
              <p className="text-sm text-gray-600">
                Rendez-vous en agence SFD avec le QR code pour effectuer votre dépôt.
              </p>
              <Button 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setIsQRScannerOpen(true)}
              >
                <QrCode className="h-4 w-4" />
                Scanner le code QR
              </Button>
            </div>
          )}
        </div>
        
        {/* Payment status */}
        {paymentStatus === 'success' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Dépôt réussi
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Votre dépôt de {amount} FCFA a été effectué avec succès.
            </p>
          </div>
        )}
        
        {paymentStatus === 'failed' && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Échec du dépôt
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Une erreur est survenue lors du traitement de votre dépôt. Veuillez réessayer.
            </p>
            <Button className="mt-2 w-full" onClick={handlePayment}>
              Réessayer
            </Button>
          </div>
        )}
      </div>
      
      {/* QR Code Scanner Dialog */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogTrigger className="hidden">Scan QR Code</DialogTrigger>
        <QRCodeScannerDialog 
          onClose={() => setIsQRScannerOpen(false)} 
          onSuccess={handleQRScanSuccess}
          isWithdrawal={false} 
        />
      </Dialog>
    </div>
  );
};

export default MobileDepositPage;
