
import React from 'react';
import { useParams } from 'react-router-dom';
import { ClientDetails } from '@/components/sfd/ClientDetails';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';

const ClientDetailsPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      <div className="container mx-auto py-6 px-4">
        <ClientDetails client={undefined} />
      </div>
    </div>
  );
};

export default ClientDetailsPage;
