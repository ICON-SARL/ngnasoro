
import React from 'react';
import ClientsManagement from './ClientsManagement';

export const ClientManagementSystem: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
      </div>
      
      <ClientsManagement />
    </div>
  );
};
