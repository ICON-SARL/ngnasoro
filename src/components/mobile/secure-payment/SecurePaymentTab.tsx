
import React, { useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import TabHeader from './TabHeader';
import SuccessView from './SuccessView';
import SecurePaymentContent from './SecurePaymentContent';
import MobileMoneyModal from '../loan/MobileMoneyModal';
import QRCodePaymentDialog from './QRCodePaymentDialog';
import { useSecurePayment } from './hooks/useSecurePayment';
import { SfdAccount } from '@/hooks/sfd/types';

export interface SecurePaymentTabProps {
  onBack?: () => void;
  isWithdrawal?: boolean;
  loanId?: string;
  onComplete?: () => void;
  selectedSfdId?: string;
}

const SecurePaymentTab: React.FC<SecurePaymentTabProps> = ({ 
  onBack, 
  isWithdrawal = false, 
  loanId,
  onComplete,
  selectedSfdId
}) => {
  const { accounts, sfdAccounts, isLoading: accountsLoading } = useSfdAccounts();
  const { activeSfdId } = useAuth();
  
  const effectiveSfdId = selectedSfdId || activeSfdId;
  // Use sfdAccounts (transformed accounts) instead of the raw accounts data
  const selectedSfdAccount = sfdAccounts.find(acc => acc.id === effectiveSfdId);
  
  const {
    paymentSuccess,
    paymentStatus,
    progress,
    mobileMoneyInitiated,
    qrDialogOpen,
    transactionAmount,
    setMobileMoneyInitiated,
    setQrDialogOpen,
    handleBackAction,
    handlePayment,
    handleMobileMoneyPayment,
    handleScanQRCode,
    handleAmountChange,
    detectInsufficientBalance
  } = useSecurePayment({ 
    onBack, 
    isWithdrawal, 
    loanId, 
    onComplete, 
    selectedSfdId 
  });
  
  // Detect insufficient balance when account changes
  useEffect(() => {
    detectInsufficientBalance(selectedSfdAccount);
  }, [selectedSfdAccount, transactionAmount]);
  
  return (
    <div className="bg-white h-full pb-24">
      <TabHeader onBack={handleBackAction} isWithdrawal={isWithdrawal} />
      
      {paymentSuccess ? (
        <SuccessView 
          isWithdrawal={isWithdrawal} 
          amount={transactionAmount} 
          onBack={handleBackAction} 
        />
      ) : (
        <SecurePaymentContent
          isWithdrawal={isWithdrawal}
          loanId={loanId}
          transactionAmount={transactionAmount}
          progress={progress}
          paymentStatus={paymentStatus}
          selectedSfdAccount={selectedSfdAccount}
          onAmountChange={handleAmountChange}
          onScanQRCode={handleScanQRCode}
          onMobileMoneyPayment={handleMobileMoneyPayment}
          handlePayment={handlePayment}
        />
      )}
      
      {mobileMoneyInitiated && (
        <MobileMoneyModal onClose={() => setMobileMoneyInitiated(false)} isWithdrawal={isWithdrawal} />
      )}
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <QRCodePaymentDialog onClose={() => setQrDialogOpen(false)} isWithdrawal={isWithdrawal} />
      </Dialog>
    </div>
  );
};

export default SecurePaymentTab;
