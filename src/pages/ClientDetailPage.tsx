
import React from 'react';
import { useParams } from 'react-router-dom';
import { ClientDetails } from '@/components/sfd/ClientDetails';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Détails du client</h1>
        
        <ClientDetails client={{
          id: clientId || '',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+223 76 45 32 10',
          address: 'Bamako, Mali',
          status: 'active',
          createdAt: new Date().toISOString()
        }} />
      </div>
    </div>
  );
};

export default ClientDetailPage;
