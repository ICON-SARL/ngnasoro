import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import LoanTrackingTab from './LoanTrackingTab';
import LoanDetailsTab from './LoanDetailsTab';
import LoanRepaymentTab from './LoanRepaymentTab';
import QRCodePaymentDialog from './QRCodePaymentDialog';
import { LoanStatus, LoanDetails } from '@/hooks/useLoanDetails';

interface LoanTabsManagerProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  loanStatus: LoanStatus;
  loanDetails: LoanDetails;
  onMobileMoneyPayment: () => void;
  loanId?: string;
}

const LoanTabsManager: React.FC<LoanTabsManagerProps> = ({
  activeTab,
  setActiveTab,
  loanStatus,
  loanDetails,
  onMobileMoneyPayment,
  loanId
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
      <TabsList className="bg-gray-100 rounded-full p-1 mb-6">
        <TabsTrigger value="tracking" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
          Suivi
        </TabsTrigger>
        <TabsTrigger value="details" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
          Détails
        </TabsTrigger>
        <TabsTrigger value="repayment" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
          Remboursement
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="tracking">
        <LoanTrackingTab loanStatus={loanStatus} />
      </TabsContent>
      
      <TabsContent value="details">
        <LoanDetailsTab 
          totalAmount={loanStatus.totalAmount}
          loanType={loanDetails.loanType}
          loanPurpose={loanDetails.loanPurpose}
          disbursalDate={loanDetails.disbursalDate}
          endDate={loanDetails.endDate}
          interestRate={loanDetails.interestRate}
          status={loanDetails.status}
          disbursed={loanDetails.disbursed}
          withdrawn={loanDetails.withdrawn}
          onWithdraw={onMobileMoneyPayment}
        />
      </TabsContent>

      <TabsContent value="repayment">
        <Dialog>
          <LoanRepaymentTab 
            nextPaymentDue={loanStatus.nextPaymentDue}
            paymentHistory={loanStatus.paymentHistory}
            onMobileMoneyPayment={onMobileMoneyPayment}
            loanId={loanId}
          />
          <QRCodePaymentDialog 
            onClose={() => {}} 
            amount={loanStatus.remainingAmount} 
            isWithdrawal={false} 
          />
        </Dialog>
      </TabsContent>
    </Tabs>
  );
};

export default LoanTabsManager;
