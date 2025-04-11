
import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthUI from '@/components/AuthUI';

const AuthPage = () => {
  const location = useLocation();
  
  // Déterminer le mode d'authentification en fonction du chemin d'accès
  const isAdminMode = location.pathname.includes('/admin/auth');
  const isSfdMode = location.pathname.includes('/sfd/auth');
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <AuthUI />
    </div>
  );
};

export default AuthPage;
