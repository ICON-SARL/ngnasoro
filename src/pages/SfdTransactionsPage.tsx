
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { TransactionsList } from '@/components/transactions/TransactionsList';

const SfdTransactionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>
        <TransactionsList />
      </div>
    </div>
  );
};

export default SfdTransactionsPage;
