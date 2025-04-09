
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, requiredRole, requiredPermission } = location.state || {};
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-red-600 mb-2">Accès Refusé</h1>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          {requiredRole && <span className="block mt-2">Rôle requis : {requiredRole}</span>}
          {requiredPermission && <span className="block mt-2">Permission requise : {requiredPermission}</span>}
          {from && <span className="block mt-2 text-sm text-gray-500">Page demandée : {from}</span>}
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full"
            variant="outline"
          >
            Retour à la connexion
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            Page d'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
