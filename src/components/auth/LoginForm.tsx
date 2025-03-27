
import React from 'react';
import {
  ErrorDisplay,
  CooldownAlert,
  EmailInput,
  LoginButton,
  useLoginForm
} from './login';
import SuccessState from './login/SuccessState';
import VoiceAssistant from '../VoiceAssistant';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Eye, EyeOff, Lock } from 'lucide-react';

const LoginForm = () => {
  const {
    email,
    setEmail,
    isLoading,
    errorMessage,
    cooldownActive,
    cooldownTime,
    emailSent,
    handleLogin,
    password,
    setPassword,
    showPassword,
    toggleShowPassword
  } = useLoginForm();

  if (emailSent) {
    return <SuccessState email={email} />;
  }

  return (
    <div className="space-y-6 bg-white shadow-lg rounded-lg p-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Identifiez-vous à votre compte</h2>
        <p className="text-gray-600 text-sm">Veuillez vous identifier à votre compte afin de nous autoriser à récupérer vos données :</p>
      </div>
      
      <ErrorDisplay message={errorMessage} />
      <CooldownAlert active={cooldownActive} remainingTime={cooldownTime} />

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium mb-1">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input 
                id="email"
                type="email"
                placeholder="jean.dulac@anatec.io"
                className="pl-10 h-12 text-base border border-gray-300 focus:border-[#0D6A51] focus:ring-[#0D6A51] rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || cooldownActive}
                autoComplete="email"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password" className="text-gray-700 font-medium mb-1">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••••"
                className="pl-10 pr-10 h-12 text-base border border-gray-300 focus:border-[#0D6A51] focus:ring-[#0D6A51] rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || cooldownActive}
                autoComplete="current-password"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms" className="text-sm text-gray-700">
            J'accepte les <a href="#" className="text-[#0D6A51] hover:underline">conditions d'utilisation</a>
          </Label>
        </div>
        
        <div className="pt-4 space-y-3">
          <button 
            type="submit" 
            className="w-full h-12 rounded-md font-semibold text-white bg-[#0D6A51] hover:bg-[#0D6A51]/90 transition-all shadow-md flex items-center justify-center gap-2"
            disabled={isLoading || cooldownActive}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </span>
            ) : "Connexion"}
          </button>
          
          <button 
            type="button" 
            className="w-full h-12 rounded-md font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all shadow-sm border border-gray-200"
          >
            Précédent
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500 pt-2">
          <a href="/register" className="text-[#0D6A51] hover:underline">
            Vous n'avez pas de compte ? Inscrivez-vous ici
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
