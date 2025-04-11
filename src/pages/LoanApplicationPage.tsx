
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';

const LoanApplicationPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Demande de Prêt</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 italic mb-4">
            Le formulaire de demande de prêt est en cours de développement.
          </p>
          
          {user && (
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm">
                Utilisateur connecté: {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationPage;
