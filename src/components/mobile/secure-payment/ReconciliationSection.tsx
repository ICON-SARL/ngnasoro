
import React from 'react';
import { InfoIcon } from 'lucide-react';

export const ReconciliationSection: React.FC = () => {
  return (
    <div className="bg-amber-50 p-4 rounded-lg">
      <div className="flex">
        <InfoIcon className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">Information importante</p>
          <p className="text-amber-700 text-xs">
            Votre paiement sera traité dans un délai de 24 à 48 heures ouvrables. 
            Une fois la transaction confirmée, elle apparaîtra dans votre historique de transactions.
          </p>
        </div>
      </div>
    </div>
  );
};
