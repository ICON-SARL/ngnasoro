
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft, RefreshCw, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ActivationPanel } from '@/components/ActivationPanel';

const AccessDeniedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const from = location.state?.from || '/';
  const requiredPermission = location.state?.requiredPermission;
  const requiredRole = location.state?.requiredRole;
  const [showActivation, setShowActivation] = useState(false);

  const handleRefreshSession = async () => {
    await refreshSession();
    // Rediriger vers la page précédente après le rafraîchissement de la session
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
        
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          {requiredRole && (
            <span className="block mt-2">
              Rôle requis: <strong>{requiredRole}</strong>
            </span>
          )}
          {requiredPermission && (
            <span className="block mt-2">
              Permission requise: <strong>{requiredPermission}</strong>
            </span>
          )}
        </p>
        
        {user && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
            <h3 className="text-sm font-semibold mb-1">Informations utilisateur :</h3>
            <p className="text-xs text-gray-500">ID: {user.id}</p>
            <p className="text-xs text-gray-500">Email: {user.email}</p>
            <p className="text-xs text-gray-500">Rôle actuel: {user.app_metadata?.role || 'Non défini'}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button
            variant="outline"
            className="border-gray-200 inline-flex items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <Button
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 inline-flex items-center"
            onClick={handleRefreshSession}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir la session
          </Button>
          
          <Button
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 inline-flex items-center"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
        
        {!showActivation ? (
          <div className="border-t pt-4 mt-4">
            <Button 
              variant="outline" 
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 inline-flex items-center"
              onClick={() => setShowActivation(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Activer les Tables et Rôles
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <ActivationPanel onActivationComplete={handleRefreshSession} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessDeniedPage;
