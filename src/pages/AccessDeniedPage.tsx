
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-red-600 text-center mb-2">Accès refusé</h1>
        
        <div className="bg-red-50 border border-red-100 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6 text-center">
          Veuillez contacter votre administrateur si vous pensez que ceci est une erreur.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button 
            variant="default"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Retourner à l'accueil
          </Button>
          
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate('/auth')}
          >
            Se connecter avec un autre compte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
