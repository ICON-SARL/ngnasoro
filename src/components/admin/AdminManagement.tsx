
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAccountsManager } from './roles/AdminAccountsManager';
import { AdminRoleManager } from './roles/AdminRoleManager';
import { useAdminManagement } from './hooks/useAdminManagement';

export function AdminManagement() {
  const [activeTab, setActiveTab] = useState('accounts');
  const adminManagement = useAdminManagement();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gestion des Administrateurs</h1>
        <p className="text-sm text-muted-foreground">
          Créez et gérez les comptes administrateurs et leurs rôles
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts">
          <AdminAccountsManager />
        </TabsContent>
        
        <TabsContent value="roles">
          <AdminRoleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminManagement;
