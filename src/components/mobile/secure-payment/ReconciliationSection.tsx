
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export const ReconciliationSection: React.FC = () => {
  return (
    <Card className="border-0 shadow-sm bg-gray-50">
      <CardContent className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-1.5">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          Réconciliation des paiements
        </h3>
        
        <p className="text-sm text-gray-600 mb-2">
          Les paiements sont réconciliés automatiquement avec votre compte SFD.
        </p>
        <p className="text-sm text-gray-600">
          Les délais de traitement peuvent varier selon la méthode de paiement.
        </p>
      </CardContent>
    </Card>
  );
};
