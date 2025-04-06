
import React from 'react';
import { DashboardCards } from './DashboardCards';
import { DistributionChart } from './DistributionChart';
import { TransactionsTable } from './TransactionsTable';
import { ChartsDisplay } from './ChartsDisplay';
import { Transaction } from '@/types/transactions';

interface ReportTabContentProps {
  activeTab: string;
  transactions: Transaction[];
  isLoading: boolean;
}

export const ReportTabContent: React.FC<ReportTabContentProps> = ({
  activeTab,
  transactions,
  isLoading
}) => {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4 mt-4">
        <DashboardCards transactions={transactions} />
        <DistributionChart isLoading={isLoading} />
      </div>
    );
  }

  if (activeTab === 'transactions') {
    return (
      <div className="mt-4">
        <TransactionsTable transactions={transactions} isLoading={isLoading} />
      </div>
    );
  }

  if (activeTab === 'charts') {
    return (
      <div className="mt-4">
        <ChartsDisplay />
      </div>
    );
  }

  return null;
};
