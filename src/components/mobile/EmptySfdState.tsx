
import React from 'react';
import { Building, PhoneCall } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EmptySfdState: React.FC = () => {
  return (
    <Card>
      <CardContent className="text-center p-6">
        <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
        <p className="text-sm text-gray-500 mb-4">
          Vous n'avez pas encore de compte auprès d'une institution financière.
          Pour devenir client, veuillez contacter directement une SFD de votre choix.
        </p>
        <div className="space-y-2">
          <a 
            href="tel:+123456789"
            className="inline-flex items-center justify-center w-full p-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <PhoneCall className="h-4 w-4 mr-2" />
            Contacter le support
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptySfdState;
