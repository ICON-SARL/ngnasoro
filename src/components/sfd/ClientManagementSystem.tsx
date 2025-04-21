
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Phone, Users, UserPlus } from 'lucide-react';
import { ClientsTable } from './ClientsTable';
import ClientByPhoneSearch from './client-accounts/ClientByPhoneSearch';

export const ClientManagementSystem = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <Button className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau Client
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Ce module vous permet de gérer vos clients, de consulter leurs informations et de suivre leurs activités.
      </p>
      
      <Tabs defaultValue="all-clients" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="all-clients">
            <Users className="mr-2 h-4 w-4" />
            Liste des clients
          </TabsTrigger>
          <TabsTrigger value="phone-search">
            <Phone className="mr-2 h-4 w-4" />
            Recherche par téléphone
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-clients">
          <ClientsTable />
        </TabsContent>
        
        <TabsContent value="phone-search">
          <ClientByPhoneSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
};
