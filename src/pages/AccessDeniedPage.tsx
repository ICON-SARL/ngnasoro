
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/auth';

const AccessDeniedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { requiredPermission, requiredRole } = location.state || {};
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start mt-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div className="text-left">
              <p className="text-red-800 font-medium">Vous n'avez pas les autorisations nécessaires</p>
              <p className="text-red-700 text-sm mt-1">
                {requiredPermission && (
                  <span>Permission requise: <strong>{requiredPermission}</strong></span>
                )}
                {requiredRole && (
                  <span>Rôle requis: <strong>{requiredRole}</strong></span>
                )}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            Veuillez contacter votre administrateur pour obtenir les accès nécessaires pour accéder à cette page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <Button 
              className="flex-1"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
