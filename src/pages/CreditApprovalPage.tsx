
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { CreditApplicationList } from '@/components/admin/credit/CreditApplicationList';
import { CreditScoringPanel } from '@/components/admin/credit/CreditScoringPanel';
import { CreditNotificationSettings } from '@/components/admin/credit/CreditNotificationSettings';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { SfdAuditLog } from '@/components/admin/SfdAuditLog';
import { AdminNotifications } from '@/components/admin/shared/AdminNotifications';
import { MerefSfdCommunication } from '@/components/admin/shared/MerefSfdCommunication';
import { MerefSubsidyTab } from '@/components/admin/MerefSubsidyTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Footer } from '@/components';

const CreditApprovalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'credit-applications';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader 
        additionalComponents={
          <div className="flex items-center gap-2">
            <MerefSfdCommunication />
            <AdminNotifications />
          </div>
        } 
      />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Approbation de Crédit et Gestion des SFDs</h2>
          <p className="text-muted-foreground">
            Évaluez les dossiers de crédit, paramétrez le système de scoring et administrez les partenaires SFDs
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="credit-applications">Dossiers de crédit</TabsTrigger>
            <TabsTrigger value="scoring">Système de Scoring</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="sfd-management">Gestion des SFDs</TabsTrigger>
            <TabsTrigger value="sfd-audit">Historique SFDs</TabsTrigger>
            <TabsTrigger value="subsidy-requests">Demandes de prêts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credit-applications">
            <CreditApplicationList />
          </TabsContent>
          
          <TabsContent value="scoring">
            <CreditScoringPanel />
          </TabsContent>
          
          <TabsContent value="notifications">
            <CreditNotificationSettings />
          </TabsContent>
          
          <TabsContent value="sfd-management">
            <SfdManagement />
          </TabsContent>
          
          <TabsContent value="sfd-audit">
            <SfdAuditLog />
          </TabsContent>
          
          <TabsContent value="subsidy-requests">
            <MerefSubsidyTab />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreditApprovalPage;
