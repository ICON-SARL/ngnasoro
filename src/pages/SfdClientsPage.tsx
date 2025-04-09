
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';

const SfdClientsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">
            Gérez les comptes clients et leurs informations
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          {/* Client management content will go here */}
          <p className="text-center text-muted-foreground py-8">
            Fonctionnalité de gestion des clients en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
};

export default SfdClientsPage;
