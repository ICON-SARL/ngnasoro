
import React from 'react';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const SfdDashboardPage = () => {
  const { user, activeSfdId } = useAuth();
  const navigate = useNavigate();
  
  // Récupérer le rôle de l'utilisateur depuis les métadonnées
  const userRole = user?.app_metadata?.role;
  
  // Si c'est un admin SFD standard, vérifier qu'une SFD est sélectionnée
  // Les super_admin et admin ne sont pas soumis à cette vérification
  if (userRole === 'sfd_admin' && !activeSfdId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Aucune SFD Sélectionnée</h2>
          <p className="text-gray-600 mb-4">
            Vous devez sélectionner une SFD pour accéder au tableau de bord.
          </p>
          <Button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/sfd-selection')}
          >
            Sélectionner une SFD
          </Button>
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
