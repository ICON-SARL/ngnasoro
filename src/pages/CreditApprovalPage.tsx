
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { CreditApplicationList } from '@/components/admin/credit/CreditApplicationList';
import { CreditScoringPanel } from '@/components/admin/credit/CreditScoringPanel';
import { CreditNotificationSettings } from '@/components/admin/credit/CreditNotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CreditApprovalPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Approbation de Crédit</h2>
          <p className="text-muted-foreground">
            Gérez les demandes de crédit des SFDs et configurez le système de scoring
          </p>
        </div>
        
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Demandes</TabsTrigger>
            <TabsTrigger value="scoring">Système de Scoring</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications">
            <CreditApplicationList />
          </TabsContent>
          
          <TabsContent value="scoring">
            <CreditScoringPanel />
          </TabsContent>
          
          <TabsContent value="notifications">
            <CreditNotificationSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CreditApprovalPage;
