
import React from 'react';
import { Card } from '@/components/ui/card';
import AccountBalance from './AccountBalance';
import NextPayment from './NextPayment';

interface FinancialSnapshotProps {
  account?: any;
}

const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({ account }) => {
  // Extract needed data from account
  const balance = account?.balance || 0;
  const currency = account?.currency || 'FCFA';
  const loans = account?.loans || [];
  
  // Find the next payment if any
  const nextLoanPayment = loans.find(loan => 
    loan.status === 'active' && loan.next_payment_date
  );

  return (
    <Card className="p-5 rounded-xl border shadow-sm bg-white">
      <div className="space-y-6">
        <AccountBalance balance={balance} currency={currency} />
        
        {nextLoanPayment && (
          <NextPayment loan={nextLoanPayment} />
        )}
      </div>
    </Card>
  );
};

export default FinancialSnapshot;
