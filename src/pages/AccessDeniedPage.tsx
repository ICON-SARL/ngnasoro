
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AccessDeniedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { requiredRole, from } = location.state || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-50 p-4 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-red-700">Accès Refusé</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            {requiredRole && (
              <span className="block mt-2">
                Rôle requis : <strong>{Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}</strong>
              </span>
            )}
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/auth')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retourner à la page de connexion
            </Button>
            
            {from && (
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => navigate(-1)}
              >
                Retour à la page précédente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
