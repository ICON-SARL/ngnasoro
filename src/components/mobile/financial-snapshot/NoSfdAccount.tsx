
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DiscoverSfdsDialog from '../discover-sfds/DiscoverSfdsDialog';

const NoSfdAccount: React.FC = () => {
  const [showDiscoverDialog, setShowDiscoverDialog] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <h3 className="font-semibold text-xl mb-2">Pas de compte SFD</h3>
      <p className="text-gray-600 mb-6">
        Vous n'avez pas encore de compte auprès d'un SFD partenaire
      </p>
      
      <Button 
        onClick={() => setShowDiscoverDialog(true)}
        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white font-medium py-2 px-6"
      >
        Découvrir les SFDs
      </Button>
      
      <DiscoverSfdsDialog 
        open={showDiscoverDialog} 
        onOpenChange={setShowDiscoverDialog} 
      />
    </div>
  );
};

export default NoSfdAccount;
