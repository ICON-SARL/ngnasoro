
import React from 'react';
import AuthUI from '@/components/AuthUI';
import { useLocation } from 'react-router-dom';

interface LoginPageProps {
  isSfdAdmin?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ isSfdAdmin = false }) => {
  const location = useLocation();
  
  // Allow direct access to auth page without splash screen requirement
  // This prevents redirect loops and allows users to access login directly
  
  return <AuthUI initialMode={isSfdAdmin ? 'sfd_admin' : 'default'} />;
};

export default LoginPage;
