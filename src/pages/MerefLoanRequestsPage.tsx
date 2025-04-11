
import React from 'react';
import { MerefLoanRequestsList } from '@/components/meref/loan-requests/MerefLoanRequestsList';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MerefLoanRequestsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Demandes de Prêt MEREF</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les demandes de prêt MEREF et les transactions associées
        </p>
      </div>
      
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Demandes de Prêt</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <MerefLoanRequestsList />
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-10 text-gray-500">
                Cette section affichera les transactions associées aux prêts MEREF.
                <br />
                Sélectionnez une demande de prêt pour voir ses transactions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerefLoanRequestsPage;
