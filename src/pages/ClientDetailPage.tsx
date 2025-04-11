
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import ClientDetails from '@/components/sfd/ClientDetailView';
import { useParams } from 'react-router-dom';

const ClientDetailPage = () => {
  const { isAdmin } = useAuth();
  const { clientId } = useParams<{ clientId: string }>();

  if (!clientId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
        <div className="container mx-auto py-6 px-4">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-800">Client non trouvé</h2>
            <p className="text-gray-600 mt-2">
              Identifiant du client manquant.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
