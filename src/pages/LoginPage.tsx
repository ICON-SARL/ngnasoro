
import React from 'react';
import AuthUI from '@/components/AuthUI';
import { useLocation, Navigate } from 'react-router-dom';

interface LoginPageProps {
  isSfdAdmin?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ isSfdAdmin = false }) => {
  const location = useLocation();
  
  // If user directly accesses /auth without seeing splash, redirect to splash
  if (location.state?.fromSplash !== true) {
    return <Navigate to="/" replace />;
  }

  return <AuthUI initialMode={isSfdAdmin ? 'sfd_admin' : 'default'} />;
};

export default LoginPage;
