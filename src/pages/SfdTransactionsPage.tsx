
import React from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent } from '@/components/ui/card';

const SfdTransactionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Gérez les transactions de votre SFD
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground text-center mb-4">
                Module de transactions en cours de développement.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdTransactionsPage;
