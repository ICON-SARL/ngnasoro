import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyAccountState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Aucun compte SFD
      </h2>
      
      <p className="text-muted-foreground mb-8 max-w-sm">
        Vous n'êtes membre d'aucune SFD pour le moment. 
        Rejoignez une SFD pour accéder aux services de microfinance.
      </p>
      
      <div className="space-y-3 w-full max-w-xs">
        <Button 
          onClick={() => navigate('/mobile-flow/profile')}
          className="w-full"
          size="lg"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Rejoindre une SFD
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => navigate('/mobile-flow/diagnostics')}
          className="w-full"
        >
          Diagnostics
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-8">
        Besoin d'aide ? Contactez le support technique
      </p>
    </div>
  );
};

export default EmptyAccountState;
