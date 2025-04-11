
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';

const SettingsPage = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 italic">
            La page des paramètres est en cours de développement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
