
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ClientAccountStateProps {
  message?: string;
  ctaLabel?: string;
  ctaRoute?: string;
}

const ClientAccountState: React.FC<ClientAccountStateProps> = ({ 
  message = "Veuillez d'abord associer un compte SFD",
  ctaLabel = "Ajouter une SFD",
  ctaRoute = "/sfd-selector"
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-sm">
      <h3 className="text-lg font-medium mb-3">Compte non configuré</h3>
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      <Button 
        onClick={() => navigate(ctaRoute)}
        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
      >
        {ctaLabel}
      </Button>
    </div>
  );
};

export default ClientAccountState;
