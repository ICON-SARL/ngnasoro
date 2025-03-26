
import React from 'react';
import { Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoanDetailsTabProps {
  totalAmount: number;
}

const LoanDetailsTab = ({ totalAmount }: LoanDetailsTabProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">Informations du prêt</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Montant</p>
              <p className="font-bold">{totalAmount.toFixed(2)} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Durée</p>
              <p className="font-bold">6 mois</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Taux d'intérêt</p>
              <p className="font-bold">2.5%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mensualité</p>
              <p className="font-bold">3,50 FCFA</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">Détails de l'achat</h3>
          <p className="text-sm text-gray-500">Date d'achat</p>
          <p className="font-bold mb-2">5 janvier 2023</p>
          
          <p className="text-sm text-gray-500">Boutique</p>
          <p className="font-bold">Insting Store</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">Institution SFD</h3>
          <div className="flex items-center mb-2">
            <Building className="h-4 w-4 mr-2 text-gray-500" />
            <p className="font-bold">Microfinance Bamako</p>
          </div>
          <p className="text-sm text-gray-500">Numéro de compte</p>
          <p className="font-bold">••••1234</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanDetailsTab;
