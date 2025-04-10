
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profil Utilisateur</h1>
        <p className="mb-2">ID: {userId || 'Non spécifié'}</p>
        {user && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Informations utilisateur connecté</h2>
            <p>Email: {user.email}</p>
            <p>Rôle: {user.app_metadata?.role || 'Non spécifié'}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserProfilePage;
