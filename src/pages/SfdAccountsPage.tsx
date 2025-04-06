
import React from 'react';
import SfdAccountsManager from '@/components/admin/sfd/SfdAccountsManager';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';

const SfdAccountsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Gestion des comptes SFD</h1>
        <SfdAccountsManager />
      </div>
    </div>
  );
};

export default SfdAccountsPage;
