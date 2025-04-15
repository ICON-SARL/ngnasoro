
import React from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SfdNavigation } from '@/components/sfd/SfdNavigation';

const SfdTransactionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">
            Suivez toutes les transactions de votre SFD
          </p>
        </div>
        
        <div className="mb-6">
          <SfdNavigation />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Historique des Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>L'historique des transactions sera affiché ici.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdTransactionsPage;
