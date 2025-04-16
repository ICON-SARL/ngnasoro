
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';

const EmptySfdState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
      <Building className="h-16 w-16 text-gray-300" />
      <h2 className="text-xl font-semibold">Aucun compte SFD</h2>
      <p className="text-gray-600 mb-2">
        Vous n'avez pas encore de compte SFD associé à votre profil.
      </p>
      <div className="space-y-3 w-full">
        <Button 
          onClick={() => navigate('/mobile-flow/sfd-selector')}
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          Ajouter un compte SFD
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/mobile-flow/sfd-selector')}
          className="w-full"
        >
          <Building className="h-4 w-4 mr-2" />
          Voir les SFDs disponibles
        </Button>
      </div>
    </div>
  );
};

export default EmptySfdState;
