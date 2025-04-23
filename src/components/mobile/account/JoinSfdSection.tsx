
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const JoinSfdSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Building className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Rejoindre une SFD
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="mb-4 text-gray-600">
            Connectez-vous à une institution de microfinance pour accéder à des services financiers
          </p>
          <Button 
            onClick={() => navigate('/mobile-flow/sfd-connection')} 
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Choisir une SFD
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinSfdSection;
