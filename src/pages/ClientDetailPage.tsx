
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import ClientDetails from '@/components/sfd/ClientDetails';

const ClientDetailPage = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <ClientDetails />
      </div>
    </div>
  );
};

export default ClientDetailPage;
