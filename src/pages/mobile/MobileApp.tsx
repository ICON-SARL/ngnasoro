
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MobileLayout from '@/components/mobile/MobileLayout';
import SfdConnectionPage from './SfdConnectionPage';
import SfdAdhesionPage from './SfdAdhesionPage';

const MobileApp: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Rediriger vers l'auth si l'utilisateur n'est pas connecté
    if (!user) {
      navigate('/auth');
      return;
    }

    // Vérifier si une redirection après auth est demandée
    const redirectPath = localStorage.getItem('redirectAfterAuth');
    if (redirectPath) {
      localStorage.removeItem('redirectAfterAuth');
      navigate(redirectPath);
    }
  }, [user, navigate]);

  // Protection des routes si non connecté
  if (!user && location.pathname !== '/auth') {
    return null; // L'utilisateur sera redirigé dans useEffect
  }

  return (
    <Routes>
      <Route path="/" element={<MobileLayout />}>
        {/* Temporary placeholder for home route */}
        <Route index element={<div className="p-4">Bienvenue sur l'application mobile</div>} />
        
        {/* SFD related routes - these components exist */}
        <Route path="sfd-connection" element={<SfdConnectionPage />} />
        <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
      </Route>
    </Routes>
  );
};

export default MobileApp;
