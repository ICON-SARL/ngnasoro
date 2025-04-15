
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent } from '@/components/ui/card';
import { LoanManagement } from '@/components/sfd/LoanManagement';

const LoansPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Gestion des Prêts</h2>
          <p className="text-muted-foreground">
            Gérez les prêts, demandes de crédit et approuver les applications
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <LoanManagement />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LoansPage;
