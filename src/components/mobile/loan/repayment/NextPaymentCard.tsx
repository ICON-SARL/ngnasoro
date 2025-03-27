
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface NextPaymentCardProps {
  nextPaymentDue: string;
  amountDue?: number;
}

const NextPaymentCard: React.FC<NextPaymentCardProps> = ({ 
  nextPaymentDue,
  amountDue = 3500
}) => {
  return (
    <Card className="bg-blue-50 border-blue-100">
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-bold">Prochain paiement</h3>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Date d'échéance</p>
            <p className="font-bold">{nextPaymentDue}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Montant dû</p>
            <p className="font-bold text-lg">{amountDue.toLocaleString()} FCFA</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextPaymentCard;
