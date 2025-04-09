
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';

const SfdReportsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Rapports SFD</h1>
          <p className="text-muted-foreground">
            Consultez et générez des rapports pour votre SFD
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          {/* Contenu des rapports sera implémenté ici */}
          <p className="text-center text-muted-foreground py-8">
            Fonctionnalité en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
};

export default SfdReportsPage;
