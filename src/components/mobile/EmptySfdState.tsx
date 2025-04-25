
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmptySfdState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-6">
      <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
      <p className="text-sm text-gray-500 mb-4">
        Vous n'avez pas encore de compte auprès d'une institution financière.
        Veuillez contacter directement une SFD pour qu'elle vous ajoute comme client.
      </p>
      <div className="space-y-2">
        <Button 
          onClick={() => navigate('/mobile-flow/sfd-selector')}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 w-full"
        >
          <Building className="h-4 w-4 mr-2" />
          Voir les institutions disponibles
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.open('tel:+123456789', '_blank')}
          className="w-full"
        >
          <PhoneCall className="h-4 w-4 mr-2" />
          Contacter le support
        </Button>
      </div>
    </div>
  );
};

export default EmptySfdState;
