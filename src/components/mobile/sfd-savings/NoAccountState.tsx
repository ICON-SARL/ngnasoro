
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NoAccountState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <h3 className="font-medium">Aucun compte SFD connecté</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Pour accéder à votre épargne et vos prêts, vous devez connecter un compte auprès d'une institution SFD.
        </p>
        <Button 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white"
          onClick={() => navigate('/sfd-selector')}
        >
          Connecter un compte SFD
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoAccountState;
