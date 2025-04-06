
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';

export const SubsidyRequestsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Demandes de Subvention</h1>
          <p className="text-muted-foreground">Gestion des demandes de subvention</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-center text-gray-500 py-8">
            La fonctionnalité de gestion des demandes de subvention sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubsidyRequestsPage;
