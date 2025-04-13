
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const NoAccountState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Aucun compte SFD</h2>
        <p className="text-gray-500 mb-4">
          Vous n'avez pas encore de compte d'épargne auprès d'une SFD.
        </p>
        <Button 
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          onClick={() => navigate('/sfd-selector')}
        >
          Connecter un SFD
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoAccountState;
