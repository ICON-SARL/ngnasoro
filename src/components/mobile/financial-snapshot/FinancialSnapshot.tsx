
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import NoSfdAccount from './NoSfdAccount';
import AccountBalance from './AccountBalance';
import NextPayment from './NextPayment';

interface FinancialSnapshotProps {
  loanId?: string;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({
  loanId,
  nextPaymentDate,
  nextPaymentAmount
}) => {
  const { activeSfdId } = useAuth();
  const navigate = useNavigate();
  
  // If no SFD account is active, show the NoSfdAccount component
  if (!activeSfdId) {
    return <NoSfdAccount onConnect={() => navigate('/sfd-selector')} />;
  }

  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <AccountBalance />
          {(loanId || nextPaymentDate) && (
            <NextPayment 
              nextPaymentDate={nextPaymentDate}
              nextPaymentAmount={nextPaymentAmount}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSnapshot;
