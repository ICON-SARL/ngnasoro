
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

const EmptyAccountsState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <CardContent className="pt-0">
      <div className="text-center py-6">
        <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-3" />
        <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
        <p className="text-gray-500 mb-4">
          Vous n'avez pas encore connecté de compte auprès d'une institution SFD.
          Connectez un compte pour accéder à vos soldes et prêts.
        </p>
        <Button 
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          onClick={() => navigate('/sfd-selector')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une SFD
        </Button>
      </div>
    </CardContent>
  );
};

export default EmptyAccountsState;
