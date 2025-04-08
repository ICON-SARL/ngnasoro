
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requiredRole = location.state?.requiredRole;
  const requiredPermission = location.state?.requiredPermission;
  const from = location.state?.from || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-red-600 mb-2">Accès Refusé</h1>
        
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
        
        {(requiredRole || requiredPermission) && (
          <div className="mb-6 p-3 bg-gray-50 rounded-md text-left">
            {requiredRole && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Rôle requis:</span> {requiredRole}
              </p>
            )}
            
            {requiredPermission && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Permission requise:</span> {requiredPermission}
              </p>
            )}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-red-600 hover:bg-red-700"
          >
            Se connecter avec un autre compte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
