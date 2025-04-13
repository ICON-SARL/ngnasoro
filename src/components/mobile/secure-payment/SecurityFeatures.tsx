
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Check } from 'lucide-react';

interface SecurityFeaturesProps {
  isWithdrawal?: boolean;
}

export const SecurityFeatures: React.FC<SecurityFeaturesProps> = ({ isWithdrawal = false }) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-green-600" />
          Fonctionnalités de sécurité
        </h3>
        
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-600 mt-0.5" />
            <span>
              Transaction sécurisée avec cryptage de bout en bout
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-600 mt-0.5" />
            <span>
              {isWithdrawal
                ? "Vérification d'identité multi-facteurs pour les retraits"
                : "Confirmation de transaction multi-facteurs"
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-600 mt-0.5" />
            <span>
              Suivi en temps réel des {isWithdrawal ? "retraits" : "paiements"}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
