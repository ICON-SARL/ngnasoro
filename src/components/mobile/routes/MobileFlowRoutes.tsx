
import React, { ReactNode } from 'react';

export interface MobileFlowRoutesProps {
  account: any;
  transactions: any[];
  transactionsLoading: boolean;
  loadMoreTransactions: () => void;
  hasMoreTransactions: boolean;
  accounts: any[];
  accountsLoading: boolean;
}

export const MobileFlowRoutes: React.FC<MobileFlowRoutesProps> = ({
  account,
  transactions,
  transactionsLoading,
  loadMoreTransactions,
  hasMoreTransactions,
  accounts,
  accountsLoading,
}) => {
  return (
    <div className="px-4 py-6 space-y-8">
      {/* Mobile Flow Routes Content */}
      <p>Mobile Flow Routes Component</p>
      {/* You can add your mobile flow routes implementation here */}
    </div>
  );
};

export default MobileFlowRoutes;
