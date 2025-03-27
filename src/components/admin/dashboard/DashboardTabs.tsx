
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminRoleManager, AdminAccountsManager } from '@/components/admin/roles';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { SfdAuditLog } from '@/components/admin/SfdAuditLog';
import { SubsidyManagement } from '@/components/admin/SubsidyManagement';
import { SystemSettings } from '@/components/admin/settings';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mt-6">
      <div className="border-b">
        <TabsList className="mx-4">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="sfds">SFDs</TabsTrigger>
          <TabsTrigger value="subsidies">Subventions</TabsTrigger>
          <TabsTrigger value="audit">Journaux d'audit</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="roles">Rôles</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>
      </div>
      
      <div className="mt-4">
        <TabsContent value="sfds">
          <SfdManagement />
        </TabsContent>
        
        <TabsContent value="subsidies">
          <SubsidyManagement />
        </TabsContent>
        
        <TabsContent value="audit">
          <SfdAuditLog />
        </TabsContent>
        
        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
        
        <TabsContent value="roles">
          <AdminRoleManager />
        </TabsContent>
        
        <TabsContent value="users">
          <AdminAccountsManager />
        </TabsContent>
      </div>
    </Tabs>
  );
}
