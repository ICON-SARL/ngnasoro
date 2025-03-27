
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, LockKeyhole, Mail } from 'lucide-react';

interface AuthModeSwitcherProps {
  authMode: 'simple' | 'advanced';
  onToggle: () => void;
  disabled: boolean;
}

const AuthModeSwitcher = ({ authMode, onToggle, disabled }: AuthModeSwitcherProps) => {
  return (
    <div className="flex items-center justify-between text-sm mt-2 px-1">
      {authMode === 'simple' ? (
        <>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-1.5 text-[#0D6A51]" />
            <span className="text-gray-700">Authentification par e-mail</span>
          </div>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-[#FFAB2E] hover:text-[#FFAB2E]/80 font-medium" 
            type="button"
            onClick={onToggle}
            disabled={disabled}
          >
            Mode avancé
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1.5 text-[#FFAB2E]" />
            <span className="text-gray-700">Authentification avancée</span>
          </div>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-gray-500 hover:text-gray-700 font-medium" 
            type="button"
            onClick={onToggle}
            disabled={disabled}
          >
            Mode simple
          </Button>
        </>
      )}
    </div>
  );
};

export default AuthModeSwitcher;
