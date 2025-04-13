
import React from 'react';
import { Loader } from '@/components/ui/loader';
import { Progress } from '@/components/ui/progress';
import { SfdAccount } from '@/hooks/sfd/types';
import { PaymentMethodTabs } from './PaymentMethodTabs';
import { SecurityFeatures } from './SecurityFeatures';
import { ReconciliationSection } from './ReconciliationSection';
import PaymentDetails from './PaymentDetails';

interface SecurePaymentContentProps {
  isWithdrawal?: boolean;
  loanId?: string;
  transactionAmount: number;
  progress: number;
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  selectedSfdAccount?: SfdAccount | null;
  onAmountChange: (amount: number) => void;
  onScanQRCode: () => void;
  onMobileMoneyPayment: () => void;
  handlePayment: () => void;
}

const SecurePaymentContent: React.FC<SecurePaymentContentProps> = ({
  isWithdrawal = false,
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
  if (paymentStatus === 'pending') {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <Loader size="lg" className="mb-6" />
        <h2 className="text-xl font-bold mb-2">
          {isWithdrawal ? "Traitement du retrait..." : "Traitement du paiement..."}
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Veuillez patienter pendant que nous traitons votre {isWithdrawal ? "retrait" : "paiement"}.
        </p>
        <Progress value={progress} className="w-full mb-4" />
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-6">
      <PaymentDetails
        isWithdrawal={isWithdrawal}
        loanId={loanId}
        transactionAmount={transactionAmount}
        onAmountChange={onAmountChange}
        selectedSfdAccount={selectedSfdAccount}
      />
      
      <PaymentMethodTabs 
        paymentMethod="sfd"
        balanceStatus="sufficient"
        paymentStatus={paymentStatus}
        onPaymentMethodChange={() => {}}
        handlePayment={handlePayment}
        isWithdrawal={isWithdrawal}
      />
      
      <SecurityFeatures isWithdrawal={isWithdrawal} />
      
      {!isWithdrawal && <ReconciliationSection />}
    </div>
  );
};

export default SecurePaymentContent;
