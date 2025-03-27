
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
    handleLogin,
    handleAuthComplete,
    toggleAuthMode
  } = useLoginForm();

  return (
    <>
      <div className="space-y-4 bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-[#0D6A51] mb-6 text-center">Connectez-vous</h2>
        
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
          
          <div className="pt-2">
            <LoginButton 
              isLoading={isLoading}
              disabled={cooldownActive}
              authMode={authMode}
            />
          </div>
          
          <SocialButtons />
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
