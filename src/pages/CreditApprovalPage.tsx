
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
import { MerefApprovalDashboard } from '@/components/admin/MerefApprovalDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CreditApprovalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'applications';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader additionalComponents={
        <div className="flex items-center gap-2">
          <MerefSfdCommunication />
          <AdminNotifications />
        </div>
      } />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Approbation de Crédit et Gestion des SFDs</h2>
          <p className="text-muted-foreground">
            Gérez les demandes de crédit des SFDs, configurez le système de scoring et gérez les SFDs
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Demandes</TabsTrigger>
            <TabsTrigger value="scoring">Système de Scoring</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="sfd-management">Gestion des SFDs</TabsTrigger>
            <TabsTrigger value="sfd-audit">Historique SFDs</TabsTrigger>
            <TabsTrigger value="meref-approval">Approbations MEREF</TabsTrigger>
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
          
          <TabsContent value="sfd-management">
            <SfdManagement />
          </TabsContent>
          
          <TabsContent value="sfd-audit">
            <SfdAuditLog />
          </TabsContent>
          
          <TabsContent value="meref-approval">
            <MerefApprovalDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CreditApprovalPage;
