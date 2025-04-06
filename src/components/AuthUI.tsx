
import React from 'react';
import ClientAuthUI from './auth/ClientAuthUI';

// Re-export the ClientAuthUI as AuthUI for compatibility
const AuthUI: React.FC = () => {
  return <ClientAuthUI />;
};

export default AuthUI;
