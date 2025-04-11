
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SfdListPopup from '../sfd-accounts/SfdListPopup';

interface NoSfdAccountProps {
  onConnect: () => void;
}

const NoSfdAccount: React.FC<NoSfdAccountProps> = ({ onConnect }) => {
  const [showSfdList, setShowSfdList] = useState(false);
  
  const handleConnectClick = () => {
    setShowSfdList(true);
  };
  
  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center py-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-2" />
          <h3 className="text-lg font-medium mb-2">Aucun compte SFD connecté</h3>
          <p className="text-gray-500 mb-4">
            Vous devez connecter un compte auprès d'une institution SFD pour accéder à vos soldes et prêts.
          </p>
          <Button 
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={handleConnectClick}
          >
            Connecter un compte SFD
          </Button>
        </div>
      </CardContent>
      
      <SfdListPopup 
        isOpen={showSfdList} 
        onClose={() => setShowSfdList(false)} 
      />
    </Card>
  );
};

export default NoSfdAccount;
