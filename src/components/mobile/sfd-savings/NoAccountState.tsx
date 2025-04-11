
import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NoAccountState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-5 h-40">
      <AlertOctagon className="h-10 w-10 text-amber-500 mb-2" />
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Pas de compte SFD</h3>
      <p className="text-sm text-center text-gray-600 mb-3">
        Vous n'avez pas encore de compte auprès d'un SFD partenaire
      </p>
      <Button 
        onClick={() => navigate('/sfd-selector')}
        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
      >
        Découvrir les SFDs
      </Button>
    </div>
  );
};

export default NoAccountState;
