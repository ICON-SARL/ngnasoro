
import React from 'react';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import { useLocation, Navigate } from 'react-router-dom';

const SfdLoginPage = () => {
  const location = useLocation();
  
  // Check if we're coming from splash screen
  const fromSplash = location.state?.fromSplash === true;
  
  // If user directly accesses /sfd/auth without seeing splash, redirect to splash
  if (!fromSplash) {
    return <Navigate to="/" replace />;
  }

  return <SfdAuthUI />;
};

export default SfdLoginPage;
