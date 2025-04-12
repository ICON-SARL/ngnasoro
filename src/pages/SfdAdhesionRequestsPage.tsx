
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { ClientAdhesionRequests } from '@/components/sfd/ClientAdhesionRequests';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/auth/usePermissions';

const SfdAdhesionRequestsPage = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canViewAdhesions = hasPermission('view_client_adhesions');
  
  if (!canViewAdhesions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <div className="container mx-auto py-6 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Demandes d'adhésion client</h1>
          <p className="text-muted-foreground">
            Gérez les demandes d'adhésion des clients à votre SFD
          </p>
        </div>
        
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle>Processus d'adhésion</AlertTitle>
          <AlertDescription className="text-blue-700">
            Lorsque vous approuvez une demande d'adhésion, un compte client est automatiquement créé dans votre SFD.
            Le client pourra alors accéder aux services financiers que vous proposez, y compris l'épargne et les prêts.
          </AlertDescription>
        </Alert>
        
        <ClientAdhesionRequests />
      </div>
    </div>
  );
};

export default SfdAdhesionRequestsPage;
