
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; requiredRole?: string } | null;
  
  const goBack = () => {
    navigate(-1);
  };
  
  const goToLogin = () => {
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Accès refusé</h1>
        
        <p className="text-gray-600 text-center mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          {state?.requiredRole && (
            <span className="block mt-2">
              Rôle requis: <strong>{state.requiredRole}</strong>
            </span>
          )}
          {state?.from && (
            <span className="block mt-1 text-sm text-gray-500">
              Page demandée: {state.from}
            </span>
          )}
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button 
            variant="outline"
            className="w-full"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retourner à la page précédente
          </Button>
          
          <Button 
            className="w-full"
            onClick={goToLogin}
          >
            Se connecter avec un autre compte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
