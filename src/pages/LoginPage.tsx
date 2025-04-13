
import React from 'react';
import AuthUI from '@/components/AuthUI';

interface LoginPageProps {
  isSfdAdmin?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ isSfdAdmin = false }) => {
  return <AuthUI initialMode={isSfdAdmin ? 'sfd_admin' : 'default'} />;
};

export default LoginPage;
