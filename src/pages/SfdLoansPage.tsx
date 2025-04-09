
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';

const SfdLoansPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Prêts</h1>
          <p className="text-muted-foreground">
            Gérez les demandes de prêts et suivez leur statut
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-center text-muted-foreground py-8">
            Fonctionnalité de gestion des prêts en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
};

export default SfdLoansPage;
