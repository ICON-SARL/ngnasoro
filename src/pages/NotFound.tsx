
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Page introuvable</h1>
      <p className="mb-6 text-gray-600">La page que vous cherchez n'existe pas ou a été déplacée.</p>
      
      <div className="space-x-4">
        <Button variant="default" onClick={() => navigate('/')}>
          Page d'accueil
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Retour en arrière
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
