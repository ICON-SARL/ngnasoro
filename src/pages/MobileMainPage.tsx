
import React from 'react';
import SFDSavingsOverview from '@/components/mobile/SFDSavingsOverview';
import { Card, CardContent } from '@/components/ui/card';

const MobileMainPage: React.FC = () => {
  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <h1 className="text-xl font-bold mb-4">Mon Espace SFD</h1>
      
      <div className="space-y-4">
        <SFDSavingsOverview />
        
        <Card>
          <CardContent className="p-4">
            <h2 className="font-medium mb-2">Accès à mes comptes SFD</h2>
            <p className="text-sm text-gray-500 mb-4">
              Gérez vos comptes SFD et accédez à vos différents services financiers.
            </p>
            
            <a 
              href="/mobile-flow/sfd-setup" 
              className="block w-full py-2 px-4 bg-[#0D6A51] text-white rounded-lg text-center"
            >
              Gérer mes comptes SFD
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileMainPage;
