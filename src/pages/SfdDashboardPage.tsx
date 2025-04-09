
import React from 'react';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const SfdDashboardPage = () => {
  const { user, activeSfdId } = useAuth();
  
  // If no active SFD is selected, redirect to selection page (to be implemented)
  if (!activeSfdId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Aucune SFD Sélectionnée</h2>
          <p className="text-gray-600 mb-4">
            Vous devez sélectionner une SFD pour accéder au tableau de bord.
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => window.location.href = '/sfd-selection'}
          >
            Sélectionner une SFD
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      <div className="container mx-auto py-6 px-4">
        <SfdDashboard />
      </div>
    </div>
  );
};

export default SfdDashboardPage;
