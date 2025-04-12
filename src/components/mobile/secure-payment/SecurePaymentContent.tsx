
import React, { useState } from 'react';
import { SfdAccount } from '@/hooks/useSfdAccounts';
import { SecurityFeatures } from './SecurityFeatures';
import { ReconciliationSection } from './ReconciliationSection';
import PaymentDetails from './PaymentDetails';
import PaymentMethodSelector from './PaymentMethodSelector';
import { Button } from '@/components/ui/button';
import { Scan, Smartphone } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SecurePaymentContentProps {
  isWithdrawal: boolean;
  loanId?: string;
  transactionAmount: number;
  progress: number;
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  selectedSfdAccount?: SfdAccount | null;
  onAmountChange: (amount: number) => void;
  onScanQRCode: () => void;
  onMobileMoneyPayment?: () => void;
  handlePayment: () => void;
}

const SecurePaymentContent: React.FC<SecurePaymentContentProps> = ({
  isWithdrawal,
  loanId,
  transactionAmount,
  progress,
  paymentStatus,
  selectedSfdAccount,
  onAmountChange,
  onScanQRCode,
  onMobileMoneyPayment,
  handlePayment
}) => {
  // Determine if balance is insufficient for withdrawal
  const insufficientBalance = isWithdrawal && 
    (selectedSfdAccount?.balance || 0) < transactionAmount;
  
  // Default to mobile if balance is insufficient, otherwise default to QR code
  const [paymentMethod, setPaymentMethod] = useState<'qrcode' | 'mobile'>(
    insufficientBalance ? 'mobile' : 'qrcode'
  );

  const handleMethodChange = (method: 'qrcode' | 'mobile') => {
    setPaymentMethod(method);
  };

  const handleActionButton = () => {
    if (paymentMethod === 'qrcode') {
      onScanQRCode();
    } else if (paymentMethod === 'mobile' && onMobileMoneyPayment) {
      onMobileMoneyPayment();
    } else {
      handlePayment(); // Fallback to default payment handler
    }
  };

  return (
    <div className="p-4 space-y-6">
      <PaymentDetails 
        isWithdrawal={isWithdrawal}
        amount={transactionAmount}
        progress={progress}
        paymentStatus={paymentStatus}
        selectedSfdAccount={selectedSfdAccount}
        onAmountChange={onAmountChange}
      />
      
      {paymentStatus === 'pending' && (
        <div className="space-y-2 my-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {isWithdrawal 
              ? "Traitement de votre retrait..." 
              : "Traitement de votre paiement..."
            }
          </p>
        </div>
      )}
      
      {/* Sélecteur de méthode de paiement */}
      <PaymentMethodSelector 
        selectedMethod={paymentMethod}
        onMethodChange={handleMethodChange}
        insufficientBalance={insufficientBalance}
        isWithdrawal={isWithdrawal}
      />
      
      {/* Afficher le bouton approprié selon la méthode sélectionnée */}
      <div className="mt-4">
        {paymentMethod === 'qrcode' ? (
          <Button 
            onClick={handleActionButton} 
            className="w-full flex items-center justify-center gap-2"
          >
            <Scan className="h-4 w-4" />
            Scanner le code QR
          </Button>
        ) : (
          <Button 
            onClick={handleActionButton} 
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600"
          >
            <Smartphone className="h-4 w-4" />
            Payer avec Mobile Money
          </Button>
        )}
      </div>
      
      <SecurityFeatures isWithdrawal={isWithdrawal} />
      
      {!isWithdrawal && !loanId && <ReconciliationSection />}
    </div>
  );
};

export default SecurePaymentContent;
