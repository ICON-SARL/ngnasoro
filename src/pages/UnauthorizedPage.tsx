
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Accès non autorisé
        </h1>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Button 
          onClick={() => navigate(-1)}
          variant="outline"
          className="mr-4"
        >
          Retour
        </Button>
        <Button 
          onClick={() => navigate('/', { replace: true })}
          className="bg-primary"
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
