
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const requiredPermission = location.state?.requiredPermission;
  const requiredRole = location.state?.requiredRole;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">Accès refusé</h1>
        
        <p className="text-gray-600 text-center mb-6">
          Vous n'avez pas l'autorisation nécessaire pour accéder à cette page.
        </p>
        
        {(requiredPermission || requiredRole) && (
          <div className="mb-6 p-3 bg-gray-50 rounded-md text-sm">
            {requiredPermission && (
              <p>Permission requise : <span className="font-medium">{requiredPermission}</span></p>
            )}
            {requiredRole && (
              <p>Rôle requis : <span className="font-medium">{requiredRole}</span></p>
            )}
          </div>
        )}
        
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
