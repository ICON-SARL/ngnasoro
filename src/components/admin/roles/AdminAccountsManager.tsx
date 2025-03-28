
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateAdminUserForm } from '@/components/admin/CreateAdminUserForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminAccountsManager() {
  const [activeTab, setActiveTab] = useState('create');
  
  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="create">Créer un compte</TabsTrigger>
          <TabsTrigger value="manage">Gérer les comptes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <CreateAdminUserForm />
        </TabsContent>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des comptes administrateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La liste des comptes administrateurs sera affichée ici.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
