import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubsidyRequestManagement } from '@/components/admin/subsidy/SubsidyRequestManagement';

export default function SubsidyApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approbation de Subventions</h1>
        <p className="text-muted-foreground">
          Examinez et approuvez les demandes de subventions des SFDs partenaires
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demandes de Subventions</CardTitle>
          <CardDescription>
            Validez ou rejetez les demandes de financement soumises par les SFDs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubsidyRequestManagement />
        </CardContent>
      </Card>
    </div>
  );
}
