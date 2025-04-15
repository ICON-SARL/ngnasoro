
import React from 'react';
import ClientsManagement from './ClientsManagement';

export const ClientManagementSystem: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-muted-foreground">Gestion des clients de la SFD</p>
      </div>
      
      <ClientsManagement />
    </div>
  );
};
