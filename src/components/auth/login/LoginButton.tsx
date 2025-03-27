
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, LogIn } from 'lucide-react';

interface LoginButtonProps {
  isLoading: boolean;
  disabled: boolean;
  authMode: 'simple' | 'advanced';
}

const LoginButton = ({ isLoading, disabled, authMode }: LoginButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full h-14 rounded-xl font-medium text-lg bg-[#0D6A51] hover:bg-[#0D6A51]/90 transition-all shadow-md"
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2 w-full">
          {authMode === 'simple' ? (
            <>
              <LogIn className="h-6 w-6" />
              Se connecter
            </>
          ) : (
            <>
              <Lock className="h-6 w-6" />
              Authentification sécurisée
            </>
          )}
        </span>
      )}
    </Button>
  );
};

export default LoginButton;
