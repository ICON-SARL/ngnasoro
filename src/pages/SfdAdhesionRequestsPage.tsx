
import React from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SfdNavigation } from '@/components/sfd/SfdNavigation';

const SfdAdhesionRequestsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Demandes d'Adhésion</h2>
          <p className="text-muted-foreground">
            Gérez les demandes d'adhésion et validez les nouveaux clients
          </p>
        </div>
        
        <div className="mb-6">
          <SfdNavigation />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Demandes en Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <p>La liste des demandes d'adhésion en attente sera affichée ici.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdAdhesionRequestsPage;
