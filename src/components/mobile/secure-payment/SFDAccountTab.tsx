
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BuildingIcon, RotateCw } from 'lucide-react';

interface SFDAccountTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
}

export const SFDAccountTab: React.FC<SFDAccountTabProps> = ({ 
  paymentStatus, 
  handlePayment, 
  isWithdrawal = false 
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BuildingIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">SFD Bamako Principal</h4>
              <p className="text-sm text-gray-500">
                {isWithdrawal ? 'Solde disponible' : 'Compte principal'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {isWithdrawal ? 'Disponible' : 'Solde'}
              </p>
              <p className="font-bold">198 500 FCFA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-2">
          {isWithdrawal 
            ? "Retrait à l'agence SFD" 
            : "Remboursement à l'agence SFD"
          }
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          {isWithdrawal 
            ? "Générez un QR code à présenter à l'agence pour retirer votre argent." 
            : "Générez un QR code à présenter à l'agence pour rembourser votre prêt."
          }
        </p>
        {paymentStatus === 'pending' ? (
          <Button disabled className="w-full">
            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </Button>
        ) : (
          <Button 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={handlePayment}
          >
            Générer un QR code
          </Button>
        )}
      </div>
    </div>
  );
};
