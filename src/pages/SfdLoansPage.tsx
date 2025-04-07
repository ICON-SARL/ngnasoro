
import React, { useState } from 'react';
import { SfdAdminDashboard } from '@/components/admin/SfdAdminDashboard';
import { LoanWorkflow } from '@/components/sfd/loans/LoanWorkflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoanPlansManager from '@/components/sfd/loans/LoanPlansManager';
import { CreditCard, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/auth';

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
        <div className="bg-white p-6 rounded-lg shadow">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestion des Prêts</h1>
              <TabsList>
                <TabsTrigger value="loans" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Prêts
                </TabsTrigger>
                <TabsTrigger value="plans" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Plans de Prêts
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="loans">
              <LoanWorkflow />
            </TabsContent>
            
            <TabsContent value="plans">
              <LoanPlansManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SfdLoansPage;
