
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';

const SfdCreditsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Crédits</h1>
          <p className="text-muted-foreground">
            Créez et gérez les crédits pour vos clients
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold mb-4">Module de Crédits</h2>
            <p className="text-gray-600 mb-2">
              Cette interface vous permettra de gérer les demandes de crédit, approuver des prêts, et suivre les remboursements.
            </p>
            <p className="text-sm text-blue-600">
              Ce module est en cours de développement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SfdCreditsPage;
