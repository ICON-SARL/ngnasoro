
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
      <ErrorDisplay message={errorMessage} />
      <CooldownAlert active={cooldownActive} remainingTime={cooldownTime} />

      <form onSubmit={handleLogin} className="space-y-4">
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
        
        <LoginButton 
          isLoading={isLoading}
          disabled={cooldownActive}
          authMode={authMode}
        />
        
        <SocialButtons />
      </form>
      
      <AuthenticationDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onComplete={handleAuthComplete}
      />
    </>
  );
};

export default LoginForm;
