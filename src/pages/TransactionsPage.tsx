
import React, { useState } from 'react';
import { TransactionMonitoring } from '@/components/TransactionMonitoring';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialReporting } from '@/components/FinancialReporting';
import { FileText, LineChart } from 'lucide-react';

const TransactionsPage = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Suivi, historique et reporting des transactions</p>
        </div>
        
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList>
            <TabsTrigger value="monitoring">
              <LineChart className="h-4 w-4 mr-2" />
              Suivi des transactions
            </TabsTrigger>
            <TabsTrigger value="reporting">
              <FileText className="h-4 w-4 mr-2" />
              Reporting financier
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="monitoring" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <TransactionMonitoring />
          </TabsContent>
          
          <TabsContent value="reporting" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <FinancialReporting />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TransactionsPage;
