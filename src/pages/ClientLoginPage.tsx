
import React from 'react';
import AuthUI from '@/components/AuthUI';
import { useLocation, Navigate } from 'react-router-dom';

const ClientLoginPage = () => {
  const location = useLocation();
  
  // Vérifier si nous venons de la page d'accueil
  const fromSplash = location.state?.fromSplash === true;
  
  // Si l'utilisateur accède directement à /client/auth sans voir d'abord la page d'accueil,
  // nous le redirigeons vers la page d'accueil
  if (!fromSplash) {
    return <Navigate to="/" replace />;
  }
  
  return <AuthUI initialMode="default" />;
};

export default ClientLoginPage;
