
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubsidyRequestManagement } from './subsidy/SubsidyRequestManagement';
import { SimplifiedMerefDashboard } from './dashboard/SimplifiedMerefDashboard';

export function MerefApprovalDashboard() {
  return (
    <div className="space-y-6">
      <SimplifiedMerefDashboard />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Gestion des Subventions MEREF</CardTitle>
          <CardDescription>
            Gérez et approuvez les demandes de subvention des SFDs partenaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubsidyRequestManagement />
        </CardContent>
      </Card>
    </div>
  );
}
