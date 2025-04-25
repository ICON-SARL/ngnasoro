
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientSearch } from './ClientSearch';
import ClientList from '@/components/mobile/sfd-clients/ClientList';
import { NewClientForm } from './NewClientForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ClientManagement = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Clients</h1>
      
      <ClientSearch />
      
      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="existing">Liste des Clients</TabsTrigger>
          <TabsTrigger value="new">Nouveau Client</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing">
          <ClientList />
        </TabsContent>
        
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Créer un nouveau client</CardTitle>
            </CardHeader>
            <CardContent>
              <NewClientForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
