
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface PaymentHistory {
  id: number;
  date: string;
  amount: number;
  status: string;
}

interface PaymentHistoryCardProps {
  paymentHistory: PaymentHistory[];
}

export const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ 
  paymentHistory 
}) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="font-bold mb-3">Historique des paiements</h3>
        
        {paymentHistory.length > 0 ? (
          <div className="space-y-3">
            {paymentHistory.map(payment => (
              <div key={payment.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <p className="font-medium">{payment.date}</p>
                  <p className="text-xs text-gray-500">Paiement mensuel</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{payment.amount.toLocaleString()} FCFA</p>
                  <p className={`text-xs ${
                    payment.status === 'paid' 
                      ? 'text-green-600' 
                      : payment.status === 'pending' 
                        ? 'text-amber-600' 
                        : 'text-red-600'
                  }`}>
                    {payment.status === 'paid' 
                      ? 'Payé' 
                      : payment.status === 'pending' 
                        ? 'En attente' 
                        : 'En retard'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <Clock className="h-5 w-5 mr-2 opacity-70" />
            <p>Aucun paiement effectué</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
