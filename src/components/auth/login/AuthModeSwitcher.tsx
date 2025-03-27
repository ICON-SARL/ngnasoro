
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface AuthModeSwitcherProps {
  authMode: 'simple' | 'advanced';
  onToggle: () => void;
  disabled: boolean;
}

const AuthModeSwitcher = ({ authMode, onToggle, disabled }: AuthModeSwitcherProps) => {
  return (
    <div className="flex items-center justify-between text-sm mt-2">
      {authMode === 'simple' ? (
        <>
          <div className="flex items-center">
            <span className="text-gray-600">Authentification par lien magique</span>
          </div>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-[#FFAB2E] hover:text-[#FFAB2E]/80 font-medium" 
            type="button"
            onClick={onToggle}
            disabled={disabled}
          >
            Méthode avancée
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1 text-[#FFAB2E]" />
            <span className="text-gray-600">Authentification avancée activée</span>
          </div>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-gray-500 hover:text-gray-700" 
            type="button"
            onClick={onToggle}
            disabled={disabled}
          >
            Méthode simple
          </Button>
        </>
      )}
    </div>
  );
};

export default AuthModeSwitcher;
