
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-4xl font-bold text-[#0D6A51]">404</div>
      <h1 className="text-2xl font-bold mt-2">Page non trouvée</h1>
      <p className="text-muted-foreground mt-2 text-center">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <div className="mt-6">
        <Button onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
