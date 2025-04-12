
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, Info, Users, UserPlus, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useNavigate } from 'react-router-dom';
import ClientsManagement from './ClientsManagement';
import { ClientAdhesionRequests } from './ClientAdhesionRequests';
import { usePermissions } from '@/hooks/auth/usePermissions';

export function ClientManagementSystem() {
  const { user } = useAuth();
  const { activeSfdId, sfdData, isLoading } = useSfdDataAccess();
  const [activeTab, setActiveTab] = useState('clients');
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canViewAdhesions = hasPermission('view_client_adhesions');
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des données SFD...</p>
      </div>
    );
  }
  
  if (!activeSfdId) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de configuration</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>Aucune SFD active n'a été détectée pour votre compte. Pour résoudre ce problème :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Votre compte doit être associé à au moins une SFD</li>
            <li>Une SFD doit être définie comme active</li>
          </ul>
          <div className="pt-2">
            <Button
              onClick={() => navigate('/sfd-setup')}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Configurer votre compte SFD
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Récupérer le nom de la SFD active pour l'afficher
  const activeSfd = sfdData.find(sfd => sfd.id === activeSfdId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Système de Gestion des Clients</h1>
        {activeSfd && (
          <div className="bg-[#0D6A51]/10 text-[#0D6A51] px-3 py-1 rounded-full text-sm font-medium">
            SFD active: {activeSfd.name}
          </div>
        )}
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
          {canViewAdhesions && (
            <TabsTrigger value="adhesions" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-1" />
              Demandes d'adhésion
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="clients">
          <ClientsManagement />
        </TabsContent>
        
        {canViewAdhesions && (
          <TabsContent value="adhesions">
            <ClientAdhesionRequests />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
