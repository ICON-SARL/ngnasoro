
import React from 'react';
import { SfdAdminLayout } from '@/components/sfd/SfdAdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { LoanManagement } from '@/components/sfd/LoanManagement';

const SfdLoansPage: React.FC = () => {
  return (
    <SfdAdminLayout>
      <div className="container p-6">
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
      </div>
    </SfdAdminLayout>
  );
};

export default SfdLoansPage;
