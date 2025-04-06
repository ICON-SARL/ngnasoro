
import React from 'react';
import Logo from './auth/Logo';
import LanguageSelector from './LanguageSelector';
import { useAuthUI } from './auth/ui/useAuthUI';
import AuthSuccess from './auth/ui/AuthSuccess';
import AuthLoading from './auth/ui/AuthLoading';
import AuthContent from './auth/ui/AuthContent';

const AuthUI = () => {
  const {
    activeTab,
    setActiveTab,
    authMode,
    authSuccess,
    loading,
    user
  } = useAuthUI();

  // Show success screen after successful OAuth login
  if (authSuccess) {
    return <AuthSuccess />;
  }

  // Show loading screen while checking authentication
  if (loading) {
    return <AuthLoading />;
  }

  // Show auth UI when not authenticated and not loading
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <AuthContent 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          authMode={authMode}
        />
      </div>
    </div>
  );
};

export default AuthUI;
