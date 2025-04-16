
import React from 'react';
import AuthUI from '@/components/AuthUI';
import { useLocation, Navigate } from 'react-router-dom';

const LoginPage = () => {
  const location = useLocation();
  
  // If user directly accesses /auth without seeing splash, redirect to splash
  if (location.state?.fromSplash !== true) {
    return <Navigate to="/" replace />;
  }

  return <AuthUI />;
};

export default LoginPage;
