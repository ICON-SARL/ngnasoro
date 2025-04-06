
import React, { useState, useEffect } from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { useAuth } from '@/hooks/useAuth';

const SfdClientsPage: React.FC = () => {
  const { user, activeSfdId } = useAuth();
  
  if (!activeSfdId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AgencyHeader />
        <div className="container mx-auto py-8 px-4">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800">
            <h2 className="font-medium text-lg">Aucune SFD active</h2>
            <p className="mt-2">Veuillez configurer votre compte SFD pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">Ajoutez, validez et gérez vos clients</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <ClientManagement />
        </div>
      </div>
    </div>
  );
};

export default SfdClientsPage;
