
import React from 'react';
import { Building, Smartphone } from 'lucide-react';
import { DialogTrigger } from '@/components/ui/dialog';
import { 
  NextPaymentCard, 
  PaymentOptionCard, 
  PaymentHistoryCard,
  usePaymentActions 
} from './repayment';

interface PaymentHistory {
  id: number;
  date: string;
  amount: number;
  status: string;
}

interface LoanRepaymentTabProps {
  nextPaymentDue: string;
  paymentHistory: PaymentHistory[];
  onMobileMoneyPayment: () => void;
  loanId?: string;
}

const LoanRepaymentTab = ({ 
  nextPaymentDue, 
  paymentHistory, 
  onMobileMoneyPayment,
  loanId = 'LOAN123'
}: LoanRepaymentTabProps) => {
  const { handlePaymentMethod } = usePaymentActions({
    loanId,
    onMobileMoneyPayment
  });
  
  return (
    <div className="mt-2 space-y-4">
      <NextPaymentCard 
        nextPaymentDue={nextPaymentDue} 
        amountDue={3500}
      />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Options de paiement</h3>
        
        <PaymentOptionCard
          title="Mobile Money"
          description="Paiement via MTN Mobile Money"
          icon={Smartphone}
          iconBgClass="bg-yellow-100"
          iconColorClass="text-yellow-600"
          onClick={() => handlePaymentMethod('mobile')}
        />
        
        <DialogTrigger asChild>
          <PaymentOptionCard
            title="Paiement en agence SFD"
            description="Générez un QR code à présenter en agence"
            icon={Building}
            iconBgClass="bg-blue-100"
            iconColorClass="text-blue-600"
            onClick={() => handlePaymentMethod('agency')}
          />
        </DialogTrigger>
        
        <PaymentHistoryCard paymentHistory={paymentHistory} />
      </div>
    </div>
  );
};

export default LoanRepaymentTab;
