
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
      <div className="space-y-6 bg-white shadow-lg rounded-2xl p-6 border border-white/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0D6A51] mb-2">Bienvenue</h2>
          <p className="text-gray-600">Entrez votre adresse e-mail</p>
          <div className="mt-3 flex justify-center">
            <VoiceAssistant 
              message="Bienvenue. Pour vous connecter, entrez votre adresse e-mail et cliquez sur le bouton."
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
          
          <div className="pt-4">
            <LoginButton 
              isLoading={isLoading}
              disabled={cooldownActive}
              authMode={authMode}
            />
          </div>
          
          <div className="pt-2">
            <SocialButtons />
          </div>

          <div className="text-center text-base text-white mt-6 bg-[#FFAB2E]/80 p-3 rounded-xl shadow-md">
            <a href="/register" className="font-medium hover:underline">
              Pas de compte ? Inscrivez-vous ici
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
