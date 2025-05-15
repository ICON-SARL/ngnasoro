
import React from 'react';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import { useLocation } from 'react-router-dom';

const SfdLoginPage = () => {
  const location = useLocation();
  
  return <SfdAuthUI />;
};

export default SfdLoginPage;
