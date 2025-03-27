
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SfdManagement } from '@/components/admin/SfdManagement';
import SfdAccountRequests from '@/components/admin/SfdAccountRequests';
import { SubsidyManagement } from '@/components/admin/SubsidyManagement';
import { UserManagement } from '@/components/UserManagement';
import { SystemSettings } from '@/components/admin/settings/SystemSettings';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts';
import { CreditDecisionFlow } from '@/components/CreditDecisionFlow';
import { SfdAuditLog } from '@/components/admin/SfdAuditLog';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="sfds">Gestion SFDs</TabsTrigger>
        <TabsTrigger value="sfd-requests">Demandes SFD</TabsTrigger>
        <TabsTrigger value="subsidies">Subventions</TabsTrigger>
        <TabsTrigger value="user-management">Administrateurs</TabsTrigger>
        <TabsTrigger value="credit-approval">Approbation de Crédit</TabsTrigger>
        <TabsTrigger value="analytics">Analytique</TabsTrigger>
        <TabsTrigger value="audit-logs">Journaux d'audit</TabsTrigger>
        <TabsTrigger value="settings">Paramètres</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Tableau de bord principal en chargement...</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Statistiques Générales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Les statistiques sont en cours de chargement...</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="sfds" className="mt-6">
        <SfdManagement />
      </TabsContent>
      
      <TabsContent value="sfd-requests" className="mt-6">
        <SfdAccountRequests />
      </TabsContent>
      
      <TabsContent value="subsidies" className="mt-6">
        <SubsidyManagement />
      </TabsContent>
      
      <TabsContent value="user-management" className="mt-6">
        <UserManagement />
      </TabsContent>
      
      <TabsContent value="credit-approval" className="mt-6">
        <CreditDecisionFlow />
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <DashboardCharts />
      </TabsContent>
      
      <TabsContent value="audit-logs" className="mt-6">
        <SfdAuditLog />
      </TabsContent>
      
      <TabsContent value="settings" className="mt-6">
        <SystemSettings />
      </TabsContent>
    </Tabs>
  );
}
