
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const AccessDeniedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || '/';
  const requiredPermission = location.state?.requiredPermission;
  const requiredRole = location.state?.requiredRole;

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
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="border-gray-200 inline-flex items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <Button
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 inline-flex items-center"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
