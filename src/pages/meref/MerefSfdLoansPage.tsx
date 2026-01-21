
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { MerefSfdLoansList } from '@/components/meref/sfd-loans/MerefSfdLoansList';
import { MerefSfdLoansStats } from '@/components/meref/sfd-loans/MerefSfdLoansStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerefLoanTraceability } from '@/components/meref/sfd-loans/MerefLoanTraceability';
import { Building, CreditCard, GitBranch } from 'lucide-react';

const MerefSfdLoansPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Prêts MEREF aux SFD
          </h1>
          <p className="text-muted-foreground">
            Gérez les prêts octroyés aux SFD et suivez leur utilisation
          </p>
        </div>

        <MerefSfdLoansStats />

        <Tabs defaultValue="loans" className="w-full">
          <TabsList>
            <TabsTrigger value="loans" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Prêts aux SFD
            </TabsTrigger>
            <TabsTrigger value="traceability" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Traçabilité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="mt-4">
            <MerefSfdLoansList />
          </TabsContent>

          <TabsContent value="traceability" className="mt-4">
            <MerefLoanTraceability />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MerefSfdLoansPage;
