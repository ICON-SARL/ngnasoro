
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdAdminDashboard } from '@/components/admin/SfdAdminDashboard';
import { LoanWorkflow } from '@/components/LoanWorkflow';
import LoanPlansManager from '@/components/sfd/loans/LoanPlansManager';

const SfdLoansPage = () => {
  const [activeTab, setActiveTab] = useState('loans');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdAdminDashboard />
      
      <div className="container mx-auto p-4 md:p-6 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="loans">Prêts</TabsTrigger>
            <TabsTrigger value="plans">Plans de Prêts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="loans">
            <LoanWorkflow />
          </TabsContent>
          
          <TabsContent value="plans">
            <LoanPlansManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SfdLoansPage;
