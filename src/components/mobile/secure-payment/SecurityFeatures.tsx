
import React from 'react';
import { Shield } from 'lucide-react';

interface SecurityFeaturesProps {
  isWithdrawal: boolean;
}

export const SecurityFeatures: React.FC<SecurityFeaturesProps> = ({ isWithdrawal }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-start">
        <Shield className="h-6 w-6 text-green-600 mr-3 mt-1" />
        <div>
          <h3 className="font-medium mb-1">
            {isWithdrawal 
              ? "Retraits sécurisés" 
              : "Paiements sécurisés"
            }
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
              Authentification à deux facteurs
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
              Encryption des données
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
              Confirmation par SMS
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
