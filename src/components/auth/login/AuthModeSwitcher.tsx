
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
    <div className="flex items-center justify-between text-sm">
      {authMode === 'simple' ? (
        <>
          <div className="flex items-center">
            <span className="text-muted-foreground">Authentification par lien magique</span>
          </div>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-primary" 
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
            <Shield className="h-4 w-4 mr-1 text-primary" />
            <span className="text-muted-foreground">Authentification avancée activée</span>
          </div>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-muted-foreground" 
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
