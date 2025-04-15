
import React from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SfdNavigation } from '@/components/sfd/SfdNavigation';

const SfdClientsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Gestion des Clients</h2>
          <p className="text-muted-foreground">
            Gérez vos clients, consultez leurs informations et suivez leurs activités
          </p>
        </div>
        
        <div className="mb-6">
          <SfdNavigation />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Liste des Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p>La liste des clients sera affichée ici.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdClientsPage;
