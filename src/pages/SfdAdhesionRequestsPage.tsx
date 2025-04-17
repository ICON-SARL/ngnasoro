
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { ClientAdhesionRequests } from '@/components/sfd/ClientAdhesionRequests';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';

const SfdAdhesionRequestsPage = () => {
  const { hasPermission } = usePermissions();
  const { adhesionRequests, isLoadingAdhesionRequests, refetchAdhesionRequests } = useClientAdhesions();
  const canViewAdhesions = hasPermission('view_client_adhesions');
  
  if (!canViewAdhesions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <main className="container mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Demandes d'adhésion</h1>
          <p className="text-muted-foreground">
            Gérez les demandes d'adhésion des clients à votre SFD
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <ClientAdhesionRequests />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdAdhesionRequestsPage;
