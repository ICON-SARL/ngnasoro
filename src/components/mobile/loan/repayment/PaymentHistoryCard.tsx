
import React from 'react';
import { Card } from '@/components/ui/card';
import { Check, Clock } from 'lucide-react';

interface PaymentHistory {
  id: number;
  date: string;
  amount: number;
  status: string;
}

interface PaymentHistoryCardProps {
  paymentHistory: PaymentHistory[];
}

const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ paymentHistory }) => {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-2">Historique des paiements</h3>
      
      {paymentHistory.length === 0 ? (
        <p className="text-center py-3 text-sm text-gray-500">
          Aucun paiement enregistré
        </p>
      ) : (
        <div className="space-y-3">
          {paymentHistory.map((payment) => (
            <div key={payment.id} className="flex justify-between items-center border-b pb-2 last:border-0">
              <div>
                <p className="text-sm">{payment.date}</p>
                <p className="text-xs text-gray-500">
                  {payment.status === 'paid' ? 'Payé' : 'En attente'}
                </p>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">{payment.amount.toLocaleString()} FCFA</span>
                {payment.status === 'paid' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PaymentHistoryCard;
