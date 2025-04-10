
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, Info, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ClientsManagement from './ClientsManagement';

export function ClientManagementSystem() {
  const { user, activeSfdId } = useAuth();
  const [activeTab, setActiveTab] = useState('clients');
  
  if (!activeSfdId) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de configuration</AlertTitle>
        <AlertDescription>
          Aucune SFD active n'a été détectée pour votre compte. Veuillez contacter l'administrateur.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Système de Gestion des Clients</h1>
      </div>
      
      <Alert variant="default" className="bg-muted">
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Ce système vous permet de gérer les clients de votre SFD, de valider leurs comptes et de suivre leurs activités.
        </AlertDescription>
      </Alert>
      
      <Tabs 
        defaultValue="clients" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Clients
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients">
          <ClientsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
