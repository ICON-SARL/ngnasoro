
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { SubsidyRequestsList } from '@/components/sfd/subsidy/SubsidyRequestsList';
import { Card, CardContent } from '@/components/ui/card';

const SfdSubsidyRequestsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Demandes de Subvention</h2>
          <p className="text-muted-foreground">
            Gérez les demandes de subvention et leur statut
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <SubsidyRequestsList />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdSubsidyRequestsPage;
