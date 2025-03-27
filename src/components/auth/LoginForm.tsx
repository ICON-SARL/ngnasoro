
import React from 'react';
import {
  ErrorDisplay,
  CooldownAlert,
  EmailInput,
  AuthModeSwitcher,
  LoginButton,
  SocialButtons,
  AuthenticationDialog,
  useLoginForm
} from './login';
import SuccessState from './login/SuccessState';

const LoginForm = () => {
  const {
    email,
    setEmail,
    authMode,
    showAuthDialog,
    setShowAuthDialog,
    isLoading,
    errorMessage,
    cooldownActive,
    cooldownTime,
    emailSent,
    handleLogin,
    handleAuthComplete,
    toggleAuthMode
  } = useLoginForm();

  if (emailSent) {
    return <SuccessState email={email} />;
  }

  return (
    <>
      <div className="space-y-6 bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0D6A51] mb-2">Bienvenue</h2>
          <p className="text-gray-600 text-sm">Connectez-vous pour accéder à votre compte</p>
        </div>
        
        <ErrorDisplay message={errorMessage} />
        <CooldownAlert active={cooldownActive} remainingTime={cooldownTime} />

        <form onSubmit={handleLogin} className="space-y-5">
          <EmailInput 
            email={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || cooldownActive}
          />
          
          <AuthModeSwitcher 
            authMode={authMode}
            onToggle={toggleAuthMode}
            disabled={isLoading || cooldownActive}
          />
          
          <div className="pt-3">
            <LoginButton 
              isLoading={isLoading}
              disabled={cooldownActive}
              authMode={authMode}
            />
          </div>
          
          <SocialButtons />

          <div className="text-center text-sm text-gray-500 mt-6">
            Vous n'avez pas de compte ?{' '}
            <a href="/register" className="text-[#FFAB2E] hover:text-[#FFAB2E]/80 font-medium">
              Inscrivez-vous
            </a>
          </div>
        </form>
      </div>
      
      <AuthenticationDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onComplete={handleAuthComplete}
      />
    </>
  );
};

export default LoginForm;
