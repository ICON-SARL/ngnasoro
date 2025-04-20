
import React from 'react';
import AdminAuthUI from '@/components/auth/AdminAuthUI';
import { useLocation, Navigate } from 'react-router-dom';

const SfdLoginPage = () => {
  const location = useLocation();
  
  // Vérifier si nous venons de la page d'accueil pour éviter d'accéder directement à cette page
  const fromSplash = location.state?.fromSplash === true;
  
  // Si l'utilisateur accède directement à /sfd/auth sans voir d'abord la page d'accueil,
  // nous n'effectuons pas de redirection car nous voulons permettre l'accès direct à cette page
  
  return <AdminAuthUI />;
};

export default SfdLoginPage;
