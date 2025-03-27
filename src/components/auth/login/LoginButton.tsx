
import React from 'react';
import { Button } from '@/components/ui/button';

interface LoginButtonProps {
  isLoading: boolean;
  disabled: boolean;
  authMode: 'simple' | 'advanced';
}

const LoginButton = ({ isLoading, disabled, authMode }: LoginButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full"
      disabled={isLoading || disabled}
    >
      {isLoading 
        ? 'Chargement...' 
        : (authMode === 'simple' ? 'Se connecter' : 'Authentification sécurisée')}
    </Button>
  );
};

export default LoginButton;
