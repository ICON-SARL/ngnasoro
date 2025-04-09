
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NextPaymentCardProps {
  nextPaymentDue: string;
  amountDue: number;
  onPayNow?: () => void;
}

const NextPaymentCard: React.FC<NextPaymentCardProps> = ({ 
  nextPaymentDue, 
  amountDue,
  onPayNow
}) => {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-2">Prochain paiement</h3>
      
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-500">Échéance:</span>
        <span className="text-sm">{nextPaymentDue}</span>
      </div>
      
      <div className="flex justify-between mb-3">
        <span className="text-sm text-gray-500">Montant:</span>
        <span className="text-sm font-bold">{amountDue.toLocaleString()} FCFA</span>
      </div>
      
      <Button 
        className="w-full" 
        onClick={onPayNow}
      >
        Payer maintenant
      </Button>
    </Card>
  );
};

export default NextPaymentCard;
