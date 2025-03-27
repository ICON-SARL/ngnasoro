
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import SfdAccountRequests from '@/components/admin/SfdAccountRequests';
import { ClientManagement } from '@/components/sfd/ClientManagement';

const ClientsPage = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{isAdmin ? 'SFDs' : 'Clients'}</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gestion des SFDs et des demandes de création de compte' : 'Gestion des clients de la SFD'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          {isAdmin ? <SfdAccountRequests /> : <ClientManagement />}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
