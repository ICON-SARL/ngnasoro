
import React from 'react';
import { Shield, Lock, QrCode, Smartphone } from 'lucide-react';

interface SecurityFeaturesProps {
  isWithdrawal?: boolean;
}

export const SecurityFeatures: React.FC<SecurityFeaturesProps> = ({ isWithdrawal = false }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
      <h3 className="text-sm font-semibold mb-3">Sécurité renforcée</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-start space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Lock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium">Cryptage de bout en bout</p>
            <p className="text-xs text-gray-500">Toutes les données sont cryptées</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <Shield className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium">Transaction sécurisée</p>
            <p className="text-xs text-gray-500">Vérification biométrique</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <QrCode className="h-4 w-4 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs font-medium">QR Code unique</p>
            <p className="text-xs text-gray-500">Authentification en agence</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Smartphone className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium">Mobile Money intégré</p>
            <p className="text-xs text-gray-500">Connexion directe et sécurisée</p>
          </div>
        </div>
      </div>
    </div>
  );
};
