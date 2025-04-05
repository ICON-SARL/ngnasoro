
import React from 'react';
import { SfdAccount } from '@/hooks/sfd/types';
import QRCodeSection from './QRCodeSection';
import { SecurityFeatures } from './SecurityFeatures';
import { ReconciliationSection } from './ReconciliationSection';
import PaymentDetails from './PaymentDetails';

interface SecurePaymentContentProps {
  isWithdrawal: boolean;
  loanId?: string;
  transactionAmount: number;
  progress: number;
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  selectedSfdAccount?: SfdAccount | null;
  onAmountChange: (amount: number) => void;
  onScanQRCode: () => void;
}

const SecurePaymentContent: React.FC<SecurePaymentContentProps> = ({
  isWithdrawal,
  loanId,
  transactionAmount,
  progress,
  paymentStatus,
  selectedSfdAccount,
  onAmountChange,
  onScanQRCode
}) => {
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
      
      <QRCodeSection 
        isWithdrawal={isWithdrawal} 
        onScanQRCode={onScanQRCode} 
      />
      
      <SecurityFeatures isWithdrawal={isWithdrawal} />
      
      {!isWithdrawal && !loanId && <ReconciliationSection />}
    </div>
  );
};

export default SecurePaymentContent;
