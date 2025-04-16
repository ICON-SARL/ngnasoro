
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building } from 'lucide-react';
import MobileLayout from '@/components/mobile/layout/MobileLayout';

const SfdAdhesionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sfdId } = useParams<{ sfdId: string }>();
  
  return (
    <MobileLayout>
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0"
            onClick={() => navigate('/mobile-flow/account')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Adhésion SFD</h1>
            <p className="text-gray-500 text-sm">Demande d'adhésion à une SFD</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-16 w-16 bg-[#0D6A51]/10 rounded-full flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-[#0D6A51]" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Adhésion SFD #{sfdId}</h2>
            <p className="text-gray-500 text-sm text-center mb-4">
              Remplissez le formulaire ci-dessous pour faire une demande d'adhésion à cette SFD.
            </p>
            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => navigate('/mobile-flow/account')}
            >
              Faire une demande
            </Button>
          </CardContent>
        </Card>
        
        <p className="text-sm text-gray-500 text-center">
          Cette fonctionnalité est en cours de développement.
        </p>
      </div>
    </MobileLayout>
  );
};

export default SfdAdhesionPage;
