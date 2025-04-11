
import React from 'react';
import { useParams } from 'react-router-dom';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';

const SfdAccountPage = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Compte SFD</h1>
        <p>ID SFD: {sfdId}</p>
        
        <div className="mt-8">
          <p className="text-gray-500 italic">
            La page de détails du compte SFD est en cours de développement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SfdAccountPage;
