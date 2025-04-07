
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CooldownAlertProps {
  active: boolean;
  remainingTime: number;
}

const CooldownAlert: React.FC<CooldownAlertProps> = ({ active, remainingTime }) => {
  if (!active) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
      <div className="flex">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-amber-800">
            Trop de tentatives de connexion
          </h3>
          <div className="mt-1 text-sm text-amber-700">
            <p>
              Veuillez attendre {remainingTime} secondes avant de réessayer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CooldownAlert;
