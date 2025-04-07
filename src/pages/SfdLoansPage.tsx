
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdAdminDashboard } from '@/components/admin/SfdAdminDashboard';
import { LoanWorkflow } from '@/components/sfd/loans/LoanWorkflow';
import LoanPlansManager from '@/components/sfd/loans/LoanPlansManager';
import { useAuth } from '@/hooks/auth/AuthContext';

const SfdLoansPage = () => {
  const [activeTab, setActiveTab] = useState('loans');
  const { isAdmin, isSfdAdmin } = useAuth();
  
  // Redirect if not admin or sfd_admin
  if (!isAdmin && !isSfdAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Accès non autorisé</h1>
          <p className="mt-2">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }
  
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
