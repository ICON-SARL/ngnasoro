
import React from 'react';
import { SfdAdminLayout } from '@/components/sfd/SfdAdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { SubsidyRequestManagement } from '@/components/admin/subsidy/SubsidyRequestManagement';

const SfdSubsidyRequestPage: React.FC = () => {
  return (
    <SfdAdminLayout>
      <div className="container p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Demandes de Subvention</h2>
          <p className="text-muted-foreground">
            Gérez les demandes de subvention et suivez leur statut
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <SubsidyRequestManagement />
          </CardContent>
        </Card>
      </div>
    </SfdAdminLayout>
  );
};

export default SfdSubsidyRequestPage;
