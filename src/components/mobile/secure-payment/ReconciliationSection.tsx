
import React from 'react';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';

export const ReconciliationSection: React.FC = () => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <ArrowUp className="h-4 w-4 mr-2 text-[#0D6A51]" />
        <ArrowDown className="h-4 w-4 mr-2 text-[#0D6A51]" />
        Réconciliation journalière
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Vos transactions sont réconciliées chaque jour à 23h00 via le protocole CAMT.053
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted p-2 rounded-md text-center">
          <p className="text-xs font-medium">Dernière réconciliation</p>
          <p className="text-sm">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="bg-muted p-2 rounded-md text-center">
          <p className="text-xs font-medium">Statut</p>
          <p className="text-sm flex items-center justify-center">
            <Check className="h-3 w-3 mr-1 text-green-600" />
            Complété
          </p>
        </div>
      </div>
    </div>
  );
};
