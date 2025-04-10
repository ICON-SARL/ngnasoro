
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { ClientManagementSystem } from '@/components/sfd/ClientManagementSystem';

const SfdClientsPage = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <SfdHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <ClientManagementSystem />
      </div>
    </div>
  );
};

export default SfdClientsPage;
