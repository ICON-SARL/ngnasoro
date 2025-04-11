
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Profil</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          {user ? (
            <div>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Aucun utilisateur connecté
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
