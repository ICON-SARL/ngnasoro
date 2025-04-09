
import React from 'react';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';

export const ReconciliationSection: React.FC = () => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <ArrowUp className="h-4 w-4 mr-1 text-[#0D6A51]" />
        <ArrowDown className="h-4 w-4 mr-2 text-[#0D6A51]" />
        Historique des remboursements
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Vos remboursements sont synchronisés quotidiennement avec la SFD
      </p>
      
      <div className="space-y-3">
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">5 Juin 2023</p>
              <p className="text-xs text-gray-500">Remboursement mensuel</p>
            </div>
            <div className="text-right">
              <p className="font-bold">3 500 FCFA</p>
              <p className="text-xs flex items-center justify-end text-green-600">
                <Check className="h-3 w-3 mr-1" />
                Réglé
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">5 Mai 2023</p>
              <p className="text-xs text-gray-500">Remboursement mensuel</p>
            </div>
            <div className="text-right">
              <p className="font-bold">3 500 FCFA</p>
              <p className="text-xs flex items-center justify-end text-green-600">
                <Check className="h-3 w-3 mr-1" />
                Réglé
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
