
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NextPaymentCardProps {
  nextPaymentDue: string;
  amountDue: number;
  isLate?: boolean;
  lateFees?: number;
  onMakePayment?: () => void;
}

export const NextPaymentCard: React.FC<NextPaymentCardProps> = ({ 
  nextPaymentDue, 
  amountDue,
  isLate = false,
  lateFees = 0,
  onMakePayment 
}) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="font-bold mb-3">Prochain paiement</h3>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#0D6A51]" />
            <span className="font-medium">{nextPaymentDue}</span>
          </div>
          <span className="font-bold text-lg">{amountDue.toLocaleString()} FCFA</span>
        </div>
        
        {isLate && (
          <div className="flex items-start gap-2 bg-red-50 p-2 rounded-md mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-600">Retard de paiement</p>
              <p className="text-sm text-red-600">
                Frais supplémentaires: {lateFees.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        )}
        
        {onMakePayment && (
          <Button
            onClick={onMakePayment}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            Effectuer un paiement
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
