
import React, { useState } from 'react';
import { TransactionMonitoring } from '@/components/TransactionMonitoring';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useAuth } from '@/hooks/useAuth';

const TransactionsPage = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Suivi et historique des transactions</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <TransactionMonitoring />
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
