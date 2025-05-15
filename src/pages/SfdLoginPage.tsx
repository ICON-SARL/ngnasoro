
import React from 'react';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import { useLocation } from 'react-router-dom';

const SfdLoginPage = () => {
  const location = useLocation();
  
  // Nous supprimons la condition de redirection pour permettre l'accès direct
  // Si l'utilisateur arrive directement sur /sfd/auth, nous affichons quand même l'interface
  
  return <SfdAuthUI />;
};

export default SfdLoginPage;
