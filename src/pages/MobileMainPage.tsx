
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const MobileMainPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Page Principale Mobile</h1>
      {user ? (
        <div className="bg-white rounded-lg shadow p-4">
          <p>Vous êtes connecté en tant que {user.full_name || user.email}</p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p>Veuillez vous connecter pour accéder à toutes les fonctionnalités</p>
        </div>
      )}
    </div>
  );
};

export default MobileMainPage;
