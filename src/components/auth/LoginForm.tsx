
import React from 'react';
import {
  ErrorDisplay,
  CooldownAlert,
  EmailInput,
  LoginButton,
  SocialButtons,
  AuthenticationDialog,
  useLoginForm
} from './login';
import SuccessState from './login/SuccessState';
import VoiceAssistant from '../VoiceAssistant';

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
          <p className="text-gray-600 text-sm">Entrez votre adresse e-mail pour continuer</p>
          <div className="mt-2 flex justify-center">
            <VoiceAssistant 
              message="Bienvenue. Pour vous connecter, entrez votre adresse e-mail et cliquez sur le bouton Se connecter."
              autoPlay={true}
            />
          </div>
        </div>
        
        <ErrorDisplay message={errorMessage} />
        <CooldownAlert active={cooldownActive} remainingTime={cooldownTime} />

        <form onSubmit={handleLogin} className="space-y-5">
          <EmailInput 
            email={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || cooldownActive}
          />
          
          <div className="pt-3">
            <LoginButton 
              isLoading={isLoading}
              disabled={cooldownActive}
              authMode="simple"
            />
          </div>
          
          <SocialButtons />

          <div className="text-center text-sm text-gray-500 mt-6">
            Pas de compte ? <a href="/register" className="text-[#FFAB2E] hover:text-[#FFAB2E]/80 font-medium">Inscrivez-vous ici</a>
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
