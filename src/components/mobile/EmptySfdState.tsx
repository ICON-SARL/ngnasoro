
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmptySfdState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-6">
      <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
      <p className="text-sm text-gray-500 mb-4">
        Vous n'avez pas encore de compte SFD associé à votre profil.
      </p>
      <Button 
        onClick={() => navigate('/mobile-flow/sfd-selector')}
        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
      >
        Ajouter un compte SFD
      </Button>
    </div>
  );
};

export default EmptySfdState;
