
import React from 'react';
import { Building, PhoneCall } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const JoinSfdSection: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Building className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Comptes SFD
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="mb-4 text-gray-600">
            Pour devenir client d'une SFD, veuillez contacter directement l'institution de votre choix.
          </p>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => window.open('tel:+123456789')}
          >
            <PhoneCall className="h-4 w-4 mr-2" />
            Contacter le support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinSfdSection;
