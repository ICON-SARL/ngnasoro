
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NoSfdAccountState() {
  const navigate = useNavigate();

  const handleAddSfd = () => {
    navigate('/mobile-flow/sfd-selector');
  };

  return (
    <div className="text-center p-6 space-y-4">
      <div className="flex justify-center">
        <Building className="h-12 w-12 text-gray-300" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900">
        Aucun compte SFD
      </h2>
      
      <p className="text-gray-500">
        Vous n'avez pas encore de compte SFD associé à votre profil.
      </p>
      
      <Button 
        onClick={handleAddSfd}
        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
      >
        Ajouter un compte SFD
      </Button>
    </div>
  );
}
