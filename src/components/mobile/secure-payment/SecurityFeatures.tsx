
import React from 'react';
import { Check, Shield } from 'lucide-react';

interface SecurityFeaturesProps {
  isWithdrawal?: boolean;
}

export const SecurityFeatures: React.FC<SecurityFeaturesProps> = ({ isWithdrawal = false }) => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-4 flex items-center">
        <Shield className="h-4 w-4 mr-2 text-[#0D6A51]" />
        {isWithdrawal ? "Sécurité des retraits" : "Sécurité des remboursements"}
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="h-3 w-3 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isWithdrawal ? "Retrait sécurisé" : "Remboursement sécurisé"}
            </p>
            <p className="text-xs text-gray-500">
              Vos données de paiement sont cryptées avec le niveau de sécurité bancaire
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="h-3 w-3 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Confirmation immédiate</p>
            <p className="text-xs text-gray-500">
              {isWithdrawal 
                ? "Votre retrait est enregistré instantanément dans votre compte" 
                : "Votre remboursement est enregistré instantanément dans votre compte de prêt"
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="h-3 w-3 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Protection anti-fraude</p>
            <p className="text-xs text-gray-500">
              Toutes les transactions sont contrôlées par notre système anti-fraude 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
