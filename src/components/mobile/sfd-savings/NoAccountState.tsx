
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoAccountState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <div>
          <h3 className="font-medium text-amber-800">Aucun compte SFD actif</h3>
          <p className="text-sm text-amber-700 mt-1">
            Vous n'avez pas encore de compte SFD configuré. Pour commencer, veuillez créer ou connecter un compte SFD.
          </p>
          <Button
            className="mt-3 bg-amber-600 hover:bg-amber-700"
            onClick={() => navigate('/mobile-flow/create-sfd')}
          >
            Configurer un compte SFD
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoAccountState;
